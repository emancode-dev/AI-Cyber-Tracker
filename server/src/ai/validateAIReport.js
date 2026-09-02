import { FINDING_CODE_SET } from "../../../shared/findingCodes.js";

function requireString(value, path, maxLength) {
  if (typeof value !== "string" || !value.trim() || value.length > maxLength) throw new Error(`Invalid AI report field: ${path}`);
  return value.trim();
}

function findingCodeSet(values) {
  return new Set((values || []).filter((code) => FINDING_CODE_SET.has(code)));
}

function validateRoadmapSteps(value, path, maxItems, allowedFindings, allowedContext) {
  if (!Array.isArray(value) || value.length > maxItems) throw new Error(`Invalid AI report field: ${path}`);
  return value.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error(`Invalid AI report field: ${path}[${index}]`);
    const sourceType = item.sourceType;
    const sourceCode = requireString(item.sourceCode, `${path}[${index}].sourceCode`, 120);
    if (sourceType === "finding") {
      if (!allowedFindings.has(sourceCode)) throw new Error(`AI roadmap referenced a finding that is not eligible for roadmap action at ${path}[${index}].`);
    } else if (sourceType === "owner_context") {
      if (!allowedContext.has(sourceCode)) throw new Error(`AI roadmap referenced an unknown owner-context source at ${path}[${index}].`);
    } else {
      throw new Error(`Invalid AI report field: ${path}[${index}].sourceType`);
    }
    return { sourceType, sourceCode, action: requireString(item.action, `${path}[${index}].action`, 300) };
  });
}

export function validateAIReport(report, {
  score,
  allowedFindingCodes = [],
  allowedPriorityFindingCodes = null,
  allowedReviewFindingCodes = null,
  allowedRoadmapFindingCodes = null,
  allowedContextCodes = []
}) {
  if (!report || typeof report !== "object" || Array.isArray(report)) throw new Error("AI report must be an object.");
  if (report.score !== score) throw new Error("AI report changed the deterministic score.");

  const allAllowed = findingCodeSet(allowedFindingCodes);
  const priorityAllowed = allowedPriorityFindingCodes === null ? allAllowed : findingCodeSet(allowedPriorityFindingCodes);
  const reviewAllowed = allowedReviewFindingCodes === null ? allAllowed : findingCodeSet(allowedReviewFindingCodes);
  const roadmapAllowed = allowedRoadmapFindingCodes === null
    ? new Set([...priorityAllowed, ...reviewAllowed])
    : findingCodeSet(allowedRoadmapFindingCodes);
  const allowedContext = new Set((allowedContextCodes || []).filter((code) => typeof code === "string" && /^CTX_[A-Z0-9_]+$/.test(code)));

  if (!Array.isArray(report.priorities) || report.priorities.length > 6) throw new Error("Invalid AI report priorities.");
  if (!Array.isArray(report.manualReview) || report.manualReview.length > 6) throw new Error("Invalid AI report manual review.");
  if (!report.roadmap || typeof report.roadmap !== "object") throw new Error("Invalid AI report roadmap.");

  const checkFindingCode = (code, path, allowed, purpose) => {
    if (typeof code !== "string" || !allAllowed.has(code)) {
      throw new Error(`AI report referenced an unknown finding at ${path}.`);
    }
    if (!allowed.has(code)) {
      throw new Error(`AI report referenced a finding that is not eligible for ${purpose} at ${path}.`);
    }
    return code;
  };

  return {
    summary: requireString(report.summary, "summary", 1200),
    score,
    priorities: report.priorities.map((item, index) => ({
      findingCode: checkFindingCode(item?.findingCode, `priorities[${index}]`, priorityAllowed, "priority"),
      explanation: requireString(item?.explanation, `priorities[${index}].explanation`, 600)
    })),
    roadmap: {
      today: validateRoadmapSteps(report.roadmap.today, "roadmap.today", 6, roadmapAllowed, allowedContext),
      thisWeek: validateRoadmapSteps(report.roadmap.thisWeek, "roadmap.thisWeek", 8, roadmapAllowed, allowedContext),
      thisMonth: validateRoadmapSteps(report.roadmap.thisMonth, "roadmap.thisMonth", 8, roadmapAllowed, allowedContext)
    },
    manualReview: report.manualReview.map((item, index) => ({
      findingCode: checkFindingCode(item?.findingCode, `manualReview[${index}]`, reviewAllowed, "manual review"),
      reason: requireString(item?.reason, `manualReview[${index}].reason`, 500)
    }))
  };
}
