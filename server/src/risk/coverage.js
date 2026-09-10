import { FINDING_CODES } from "../../../shared/findingCodes.js";

const CONTROL_GROUPS = [
  [FINDING_CODES.HTTPS_PRESENT, FINDING_CODES.HTTPS_MISSING],
  [FINDING_CODES.TLS_CERT_VALID, FINDING_CODES.TLS_CERT_INVALID, FINDING_CODES.TLS_CERT_EXPIRED, FINDING_CODES.TLS_CERT_EXPIRING_SOON, FINDING_CODES.TLS_CHECK_INCONCLUSIVE],
  [FINDING_CODES.CSP_PRESENT, FINDING_CODES.CSP_MISSING],
  [FINDING_CODES.HSTS_PRESENT, FINDING_CODES.HSTS_MISSING, FINDING_CODES.HSTS_WEAK],
  [FINDING_CODES.X_CONTENT_TYPE_OPTIONS_PRESENT, FINDING_CODES.X_CONTENT_TYPE_OPTIONS_MISSING],
  [FINDING_CODES.REFERRER_POLICY_PRESENT, FINDING_CODES.REFERRER_POLICY_MISSING, FINDING_CODES.REFERRER_POLICY_WEAK, FINDING_CODES.REFERRER_POLICY_INVALID],
  [FINDING_CODES.FRAME_PROTECTION_PRESENT, FINDING_CODES.FRAME_PROTECTION_MISSING, FINDING_CODES.FRAME_PROTECTION_LEGACY_ONLY, FINDING_CODES.FRAME_PROTECTION_PERMISSIVE, FINDING_CODES.FRAME_PROTECTION_INVALID],
  [FINDING_CODES.PERMISSIONS_POLICY_PRESENT, FINDING_CODES.PERMISSIONS_POLICY_MISSING],
  [FINDING_CODES.COOP_PRESENT, FINDING_CODES.COOP_MISSING, FINDING_CODES.COOP_WEAK],
  [FINDING_CODES.SERVER_DISCLOSURE_PRESENT, FINDING_CODES.SERVER_DISCLOSURE_NOT_OBSERVED],
  [FINDING_CODES.COOKIE_SECURE_PRESENT, FINDING_CODES.COOKIE_SECURE_MISSING],
  [FINDING_CODES.COOKIE_HTTPONLY_PRESENT, FINDING_CODES.COOKIE_HTTPONLY_MISSING],
  [FINDING_CODES.COOKIE_SAMESITE_PRESENT, FINDING_CODES.COOKIE_SAMESITE_MISSING]
];

const UNTESTED_AREAS = Object.freeze([
  "server-side authorization correctness",
  "database configuration and access controls",
  "internal APIs and private network services",
  "source-code dependency and supply-chain vulnerabilities",
  "admin MFA independently verified by the scanner",
  "backup restore effectiveness independently verified by the scanner"
]);

function percent(part, total) {
  return total ? Math.round((part / total) * 100) : 0;
}

export function calculateAssessmentCoverage(findings, questionnaire) {
  const codes = new Set(
    findings
      .filter((finding) => finding.observationStatus !== "inconclusive")
      .map((finding) => finding.code)
  );
  const externalAssessed = CONTROL_GROUPS.filter((group) => group.some((code) => codes.has(code))).length;
  const externalTotal = CONTROL_GROUPS.length;
  const answered = questionnaire?.progress?.answered || 0;
  const ownerTotal = questionnaire?.progress?.total || 0;
  const scopedTotal = externalTotal + ownerTotal + UNTESTED_AREAS.length;
  const covered = externalAssessed + answered;

  return {
    scopeCoveragePercent: percent(covered, scopedTotal),
    automated: { assessed: externalAssessed, total: externalTotal, percent: percent(externalAssessed, externalTotal) },
    ownerContext: { answered, total: ownerTotal, percent: percent(answered, ownerTotal) },
    independentlyObservedPercent: percent(externalAssessed, scopedTotal),
    untestedAreas: [...UNTESTED_AREAS],
    disclaimer: "Coverage describes this product's declared assessment scope. It is not the percentage of the application that is secure."
  };
}
