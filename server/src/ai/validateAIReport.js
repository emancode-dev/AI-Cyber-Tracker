import { FINDING_CODE_SET } from "../../../shared/findingCodes.js";

function requireString(value, path, maxLength) {
  if (typeof value !== "string" || !value.trim() || value.length > maxLength) throw new Error(`Invalid AI report field: ${path}`);
  return value.trim();
}

function validateSteps(value, path, maxItems) {
  if (!Array.isArray(value) || value.length > maxItems) throw new Error(`Invalid AI report field: ${path}`);
  return value.map((item, index) => requireString(item, `${path}[${index}]`, 300));
}

export function validateAIReport(report, { score, allowedFindingCodes }) {
  if (!report || typeof report !== "object" || Array.isArray(report)) throw new Error("AI report must be an object.");
  if (report.score !== score) throw new Error("AI report changed the deterministic score.");
  const allowed = new Set((allowedFindingCodes || []).filter((code) => FINDING_CODE_SET.has(code)));
  if (!Array.isArray(report.priorities) || report.priorities.length > 6) throw new Error("Invalid AI report priorities.");
  if (!Array.isArray(report.manualReview) || report.manualReview.length > 6) throw new Error("Invalid AI report manual review.");
  if (!report.roadmap || typeof report.roadmap !== "object") throw new Error("Invalid AI report roadmap.");

  const checkCode = (code, path) => {
    if (typeof code !== "string" || !allowed.has(code)) throw new Error(`AI report referenced an unknown finding at ${path}.`);
    return code;
  };

  return {
    summary: requireString(report.summary, "summary", 1200),
    score,
    priorities: report.priorities.map((item, index) => ({
      findingCode: checkCode(item?.findingCode, `priorities[${index}]`),
      explanation: requireString(item?.explanation, `priorities[${index}].explanation`, 600)
    })),
    roadmap: {
      today: validateSteps(report.roadmap.today, "roadmap.today", 6),
      thisWeek: validateSteps(report.roadmap.thisWeek, "roadmap.thisWeek", 8),
      thisMonth: validateSteps(report.roadmap.thisMonth, "roadmap.thisMonth", 8)
    },
    manualReview: report.manualReview.map((item, index) => ({
      findingCode: checkCode(item?.findingCode, `manualReview[${index}]`),
      reason: requireString(item?.reason, `manualReview[${index}].reason`, 500)
    }))
  };
}
