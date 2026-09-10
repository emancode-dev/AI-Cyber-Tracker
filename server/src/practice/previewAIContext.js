import { buildSafeAIContext } from "../ai/contextBuilder.js";
import { calculateScore } from "../risk/calculateScore.js";
import { FINDING_CODES } from "../../../shared/findingCodes.js";

const findings = [
  {
    code: FINDING_CODES.HSTS_MISSING,
    category: "headers",
    severity: "medium",
    status: "needs_attention",
    remediation: "Add a durable HSTS policy after confirming HTTPS readiness.",
    verification: "Rescan and confirm Strict-Transport-Security is present.",
    standards: { owaspTop10: ["A02:2025"], asvs: ["v5.0.0-3.4.1"], wstg: [] },
    evidenceSummary: "not forwarded"
  },
  {
    code: FINDING_CODES.COOKIE_HTTPONLY_MISSING,
    category: "cookies",
    severity: "medium",
    status: "needs_attention",
    remediation: "Apply HttpOnly to sensitive cookies that do not need JavaScript access.",
    verification: "Rescan a response that sets the cookie and confirm HttpOnly is present.",
    standards: { owaspTop10: ["A02:2025"], asvs: ["v5.0.0-3.3.4"], wstg: [] },
    rawCookie: "not forwarded"
  }
];

const answers = {
  APP_HAS_LOGIN: true,
  HAS_ADMIN_AREA: true,
  ADMIN_MFA_ENABLED: false
};

const analysis = calculateScore(findings, answers, {
  scopeCoveragePercent: 45,
  independentlyObservedPercent: 45,
  untestedAreas: ["server-side authorization correctness"]
});

const context = buildSafeAIContext({ analysis, findings, answers });

console.log(JSON.stringify(context, null, 2));
