import { calculateContextAdjustments } from "./contextRules.js";
import { findingPenalty } from "./riskRules.js";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function riskLevelFromScore(score) {
  if (score >= 80) return "low";
  if (score >= 60) return "medium";
  return "high";
}

function contextRiskFromPenalty(penalty) {
  if (penalty >= 15) return "high";
  if (penalty >= 5) return "medium";
  return "low";
}

function highestPriority(a, b) {
  const rank = { low: 0, medium: 1, high: 2 };
  return rank[a] >= rank[b] ? a : b;
}

export function calculateScore(findings, answers, coverage = null) {
  const direct = findings.map((finding) => ({
    finding,
    penalty: findingPenalty(finding)
  }));

  const scannerPenalty = Math.min(100, direct.reduce((total, item) => total + item.penalty, 0));
  const score = clamp(100 - scannerPenalty, 0, 100);
  const riskLevel = riskLevelFromScore(score);

  const contextAdjustments = calculateContextAdjustments(findings, answers);
  const contextPenalty = Math.min(100, contextAdjustments.reduce((total, item) => total + item.penalty, 0));
  const contextRiskLevel = contextRiskFromPenalty(contextPenalty);
  const overallPriority = highestPriority(riskLevel, contextRiskLevel);

  const categoryPenalties = {};
  for (const item of direct) {
    const category = item.finding.category || "general";
    categoryPenalties[category] = (categoryPenalties[category] || 0) + item.penalty;
  }

  const categoryScores = Object.fromEntries(
    Object.entries(categoryPenalties).map(([category, penalty]) => [category, clamp(100 - Math.min(100, penalty), 0, 100)])
  );

  const contextCategoryPenalties = {};
  for (const adjustment of contextAdjustments) {
    contextCategoryPenalties[adjustment.category] = (contextCategoryPenalties[adjustment.category] || 0) + adjustment.penalty;
  }

  const reviewFindings = direct
    .filter((item) => item.finding.status === "manual_review")
    .map(({ finding }) => ({
      code: finding.code,
      title: finding.title,
      category: finding.category,
      severity: finding.severity,
      confidence: finding.confidence,
      reason: finding.whyItMatters || finding.evidenceSummary || "Human verification is recommended."
    }));

  const prioritizedFindings = direct
    .filter((item) => item.penalty > 0)
    .sort((a, b) => b.penalty - a.penalty)
    .slice(0, 6)
    .map(({ finding, penalty }) => ({
      code: finding.code,
      title: finding.title,
      category: finding.category,
      severity: finding.severity,
      status: finding.status,
      penalty,
      remediation: finding.remediation,
      verification: finding.verification,
      standards: finding.standards
    }));

  return {
    score,
    externalScore: score,
    riskLevel,
    externalRiskLevel: riskLevel,
    scannerPenalty,
    contextPenalty,
    contextRiskLevel,
    overallPriority,
    categoryScores,
    contextCategoryPenalties,
    prioritizedFindings,
    reviewFindings,
    contextAdjustments,
    coverage,
    disclaimer: "The external posture score is deterministic and reflects only observed scanner controls. Owner context is shown separately and changes priority, not the technical facts. This is not proof that a website is completely secure or insecure."
  };
}
