export const SEVERITY_WEIGHTS = Object.freeze({
  info: 0,
  low: 4,
  medium: 9,
  high: 18
});

export const STATUS_FACTORS = Object.freeze({
  passed: 0,
  observed: 0,
  needs_attention: 1,
  manual_review: 0.6
});

export const CONFIDENCE_FACTORS = Object.freeze({
  high: 1,
  medium: 0.7,
  low: 0.4
});

export function findingPenalty(finding) {
  const severity = SEVERITY_WEIGHTS[finding.severity] ?? 0;
  const status = STATUS_FACTORS[finding.status] ?? 0;
  const confidence = CONFIDENCE_FACTORS[finding.confidence] ?? 0.7;
  return Math.round(severity * status * confidence);
}
