import { buildSafeAIContext } from "../ai/contextBuilder.js";
import { FINDING_CODES } from "../../../shared/findingCodes.js";

const context = buildSafeAIContext({
  score: 78,
  riskLevel: "medium",
  findings: [
    { code: FINDING_CODES.HSTS_MISSING, evidenceSummary: "not forwarded" },
    { code: FINDING_CODES.COOKIE_HTTPONLY_MISSING, rawCookie: "not forwarded" }
  ],
  answers: {
    APP_HAS_LOGIN: true,
    HAS_ADMIN_AREA: true,
    ADMIN_MFA_ENABLED: false
  }
});

console.log(JSON.stringify(context, null, 2));
