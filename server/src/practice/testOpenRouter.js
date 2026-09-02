import { env } from "../config/env.js";
import { buildSafeAIContext } from "../ai/contextBuilder.js";
import { buildReportMessages } from "../ai/systemPrompt.js";
import { callOpenRouter } from "../ai/openRouterClient.js";
import { calculateScore } from "../risk/calculateScore.js";
import { FINDING_CODES } from "../../../shared/findingCodes.js";

const findings = [
  {
    code: FINDING_CODES.HSTS_MISSING,
    category: "headers",
    severity: "medium",
    status: "needs_attention",
    title: "HSTS not observed",
    remediation: "Add a durable HSTS policy after confirming HTTPS readiness.",
    verification: "Rescan and confirm Strict-Transport-Security is present.",
    standards: { owaspTop10: ["A02:2025"], asvs: ["v5.0.0-3.4.1"], wstg: [] }
  },
  {
    code: FINDING_CODES.CSP_MISSING,
    category: "headers",
    severity: "medium",
    status: "needs_attention",
    title: "Content Security Policy not observed",
    remediation: "Design and deploy a restrictive Content-Security-Policy.",
    verification: "Rescan and confirm Content-Security-Policy is present.",
    standards: { owaspTop10: ["A02:2025"], asvs: ["v5.0.0-3.4.3"], wstg: [] }
  }
];

const answers = {
  APP_HAS_LOGIN: true,
  HAS_ADMIN_AREA: false
};

const analysis = calculateScore(findings, answers, {
  scopeCoveragePercent: 40,
  independentlyObservedPercent: 40,
  untestedAreas: ["server-side authorization correctness"]
});

const fakeContext = buildSafeAIContext({ analysis, findings, answers });

console.log("Safe fake payload:");
console.log(JSON.stringify(fakeContext, null, 2));

if (!env.openRouterTestEnabled) {
  console.log(
    "\nOpenRouter network test is disabled. Set OPENROUTER_TEST_ENABLED=true only when you want to send this FAKE minimized payload."
  );
  process.exit(0);
}

const result = await callOpenRouter({
  messages: buildReportMessages(fakeContext),
  responseFormat: { type: "json_object" }
});

console.log(`\nModel: ${result.model}`);
console.log(result.content);

try {
  const parsed = JSON.parse(result.content);
  if (parsed.score !== analysis.score) {
    throw new Error("Model changed the deterministic external posture score.");
  }

  const allowed = new Set(fakeContext.findingCodes);
  const returnedCodes = [
    ...(parsed.priorities || []).map((item) => item.findingCode),
    ...(parsed.manualReview || []).map((item) => item.findingCode)
  ].filter(Boolean);

  const invented = returnedCodes.filter((code) => !allowed.has(code));
  if (invented.length) {
    throw new Error(`Model invented finding code(s): ${invented.join(", ")}`);
  }

  console.log("\nGrounding smoke check passed.");
} catch (error) {
  console.error(`\nGrounding smoke check failed: ${error.message}`);
  process.exitCode = 1;
}
