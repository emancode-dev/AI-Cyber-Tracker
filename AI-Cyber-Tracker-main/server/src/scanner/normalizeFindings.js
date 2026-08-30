import { FINDING_CODE_SET } from "../../../shared/findingCodes.js";

const SEVERITIES = new Set(["info", "low", "medium", "high"]);
const STATUSES = new Set(["passed", "needs_attention", "manual_review", "observed"]);
const CONFIDENCE = new Set(["high", "medium", "low"]);
const TYPES = new Set(["configuration", "observation", "manual_review"]);

export function createFinding(input) {
  if (!FINDING_CODE_SET.has(input.code)) throw new Error(`Unknown finding code: ${input.code}`);
  return {
    code: input.code,
    category: input.category || "general",
    severity: SEVERITIES.has(input.severity) ? input.severity : "info",
    status: STATUSES.has(input.status) ? input.status : "observed",
    confidence: CONFIDENCE.has(input.confidence) ? input.confidence : "medium",
    type: TYPES.has(input.type) ? input.type : "observation",
    title: input.title || input.code,
    evidenceSummary: input.evidenceSummary || "No evidence summary provided.",
    whyItMatters: input.whyItMatters || "This is a scanner observation that may need context."
  };
}

export function normalizeFindings(groups) {
  const flat = groups.flat().filter(Boolean).map(createFinding);
  const byCode = new Map();
  for (const finding of flat) byCode.set(finding.code, finding);
  return [...byCode.values()];
}
