import { listScoreHistory } from "../repositories/reportRepository.js";
import { getAllWebsites } from "./websiteService.js";

const RISK_RANK = { high: 0, medium: 1, low: 2 };

function riskForScore(score) {
  if (typeof score !== "number") return "unscanned";
  if (score < 60) return "high";
  if (score < 80) return "medium";
  return "low";
}

function methodologyKey(item) {
  if (!item) return null;
  return [item.scanner_version, item.rule_pack_version, item.risk_engine_version, item.questionnaire_version].map((value) => value || "unknown").join("|");
}

export function buildDashboardSummary(websites, history, now = new Date()) {
  const scored = websites.filter((website) => typeof website.score === "number");
  const average = scored.length ? Math.round(scored.reduce((total, website) => total + website.score, 0) / scored.length) : null;

  const counts = { low: 0, medium: 0, high: 0, unscanned: 0 };
  websites.forEach((website) => { counts[riskForScore(website.score)] += 1; });

  const websiteNames = new Map(websites.map((website) => [website.id, website.name]));
  const previousMethodologyByWebsite = new Map();
  const trend = history.slice(-90).map((point) => {
    const previousKey = previousMethodologyByWebsite.get(point.website_id) ?? null;
    const currentKey = methodologyKey(point);
    previousMethodologyByWebsite.set(point.website_id, currentKey);
    return {
      id: point.id,
      websiteId: point.website_id,
      websiteName: websiteNames.get(point.website_id) || "Removed website",
      score: point.score,
      riskLevel: point.risk_level,
      createdAt: point.created_at,
      methodologyComparableToPrevious: previousKey === null ? null : currentKey === previousKey,
      methodology: {
        scannerVersion: point.scanner_version || null,
        rulePackVersion: point.rule_pack_version || null,
        riskEngineVersion: point.risk_engine_version || null,
        questionnaireVersion: point.questionnaire_version || null
      }
    };
  });

  const categoryBuckets = new Map();
  for (const website of scored) {
    Object.entries(website.latest_category_scores || {}).forEach(([category, score]) => {
      if (typeof score !== "number") return;
      const bucket = categoryBuckets.get(category) || [];
      bucket.push(score);
      categoryBuckets.set(category, bucket);
    });
  }
  const categoryAverages = [...categoryBuckets.entries()]
    .map(([category, scores]) => ({
      category,
      score: Math.round(scores.reduce((total, score) => total + score, 0) / scores.length),
      sampleSize: scores.length
    }))
    .sort((a, b) => a.score - b.score);

  const priorityWatchlist = [...scored]
    .sort((a, b) => {
      const rankDifference = RISK_RANK[riskForScore(a.score)] - RISK_RANK[riskForScore(b.score)];
      return rankDifference || a.score - b.score;
    })
    .slice(0, 5)
    .map((website) => ({
      websiteId: website.id,
      name: website.name,
      url: website.url,
      score: website.score,
      riskLevel: riskForScore(website.score),
      latestScanId: website.latest_scan_id,
      latestScanStatus: website.latest_scan_status,
      detailedEvidenceAvailable: Boolean(website.latest_scan_id)
    }));

  const notifications = priorityWatchlist
    .filter((website) => website.riskLevel !== "low")
    .map((website) => ({
      id: `risk-${website.websiteId}`,
      type: website.riskLevel === "high" ? "critical" : "attention",
      title: `${website.name} is in the ${website.riskLevel}-risk range`,
      detail: website.detailedEvidenceAvailable
        ? `Current deterministic score: ${website.score}. Review the latest assessment.`
        : `Current retained deterministic score: ${website.score}. Detailed evidence has expired; run a fresh assessment to inspect current evidence.`,
      websiteId: website.websiteId
    }));

  return {
    source: "supabase-owner-scoped",
    generatedAt: now.toISOString(),
    metrics: { portfolioScore: average, monitoredSites: websites.length, scoredSites: scored.length, riskCounts: counts },
    trend,
    comparison: scored.map((website) => ({ websiteId: website.id, name: website.name, score: website.score, riskLevel: riskForScore(website.score) })),
    priorityWatchlist,
    categoryAverages,
    notifications,
    methodology: {
      portfolioScore: "Arithmetic mean of each owned website's newest retained deterministic score.",
      trend: "Chronological recent assessment results across owned websites; each bar is an independent assessment, not a single-site trajectory. Capped at the newest 90 retained points.",
      priority: "Current retained website scores ordered by risk band and then lowest score.",
      categories: "Average of each website's newest retained category score; detailed findings are not required after retention cleanup.",
      comparability: "Score deltas should be treated as directly comparable only when scanner, rule-pack, risk-engine and questionnaire versions match."
    }
  };
}

export async function getDashboardSummary(supabase) {
  const [websites, history] = await Promise.all([getAllWebsites(supabase), listScoreHistory(supabase)]);
  return buildDashboardSummary(websites, history);
}
