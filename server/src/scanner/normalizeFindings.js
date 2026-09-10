import { FINDING_CODE_SET } from "../../../shared/findingCodes.js";
import { enrichFindingMetadata } from "./findingCatalog.js";

const SEVERITIES = new Set(["info", "low", "medium", "high"]);
const STATUSES = new Set(["passed", "needs_attention", "manual_review", "observed"]);
const CONFIDENCE = new Set(["high", "medium", "low"]);
const TYPES = new Set(["configuration", "observation", "manual_review"]);
const OBSERVATION_STATUSES = new Set(["observed", "not_observed", "not_tested", "inconclusive"]);
const ASSESSMENT_STATES = new Set(["passed", "needs_attention", "manual_review"]);

function inferObservationStatus(input) {
  if (OBSERVATION_STATUSES.has(input.observationStatus)) return input.observationStatus;
  if (input.status === "manual_review") return "inconclusive";
  if (/(_MISSING|_NOT_OBSERVED)$/.test(input.code)) return "not_observed";
  return "observed";
}

function inferAssessmentState(input) {
  if (ASSESSMENT_STATES.has(input.assessmentState)) return input.assessmentState;
  if (input.status === "passed") return "passed";
  if (input.status === "needs_attention") return "needs_attention";
  return "manual_review";
}

export function createFinding(input) {
  if (!FINDING_CODE_SET.has(input.code)) throw new Error(`Unknown finding code: ${input.code}`);
  const finding = {
    code: input.code,
    category: input.category || "general",
    severity: SEVERITIES.has(input.severity) ? input.severity : "info",
    status: STATUSES.has(input.status) ? input.status : "observed",
    confidence: CONFIDENCE.has(input.confidence) ? input.confidence : "medium",
    type: TYPES.has(input.type) ? input.type : "observation",
    observationStatus: inferObservationStatus(input),
    assessmentState: inferAssessmentState(input),
    title: input.title || input.code,
    evidenceSummary: input.evidenceSummary || "No evidence summary provided.",
    whyItMatters: input.whyItMatters || "This is a scanner observation that may need context.",
    source: input.source,
    evidence: input.evidence,
    remediation: input.remediation,
    verification: input.verification,
    standards: input.standards,
    ruleVersion: input.ruleVersion
  };
  return enrichFindingMetadata(finding);
}

export function normalizeFindings(groups) {
  const flat = groups.flat().filter(Boolean).map(createFinding);
  const byCode = new Map();
  for (const finding of flat) byCode.set(finding.code, finding);
  return [...byCode.values()];
}
