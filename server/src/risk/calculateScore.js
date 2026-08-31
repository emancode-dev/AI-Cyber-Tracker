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

export function calculateScore(findings, answers) {
  const direct = findings.map((finding) => ({
    finding,
    penalty: findingPenalty(finding)
  }));

  const scannerPenalty = Math.min(
    70,
    direct.reduce((total, item) => total + item.penalty, 0)
  );

  const contextAdjustments = calculateContextAdjustments(findings, answers);
  const contextPenalty = Math.min(
    30,
    contextAdjustments.reduce((total, item) => total + item.penalty, 0)
  );

  const totalPenalty = Math.min(100, scannerPenalty + contextPenalty);
  const score = clamp(100 - totalPenalty, 0, 100);

  const categoryPenalties = {};
  for (const item of direct) {
    const category = item.finding.category || "general";
    categoryPenalties[category] =
      (categoryPenalties[category] || 0) + item.penalty;
  }
  for (const adjustment of contextAdjustments) {
    categoryPenalties[adjustment.category] =
      (categoryPenalties[adjustment.category] || 0) + adjustment.penalty;
  }

  const categoryScores = Object.fromEntries(
    Object.entries(categoryPenalties).map(([category, penalty]) => [
      category,
      clamp(100 - Math.min(100, penalty), 0, 100)
    ])
  );

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
      penalty
    }));

  return {
    score,
    riskLevel: riskLevelFromScore(score),
    scannerPenalty,
    contextPenalty,
    categoryScores,
    prioritizedFindings,
    contextAdjustments,
    disclaimer:
      "This deterministic score summarizes the checks and owner context used by AI Cyber Tracker; it is not proof that a website is completely secure or insecure."
  };
}
