import { env } from "../config/env.js";
import { buildSafeAIContext } from "../ai/contextBuilder.js";
import { buildReportMessages } from "../ai/systemPrompt.js";
import { callOpenRouter } from "../ai/openRouterClient.js";
import { FINDING_CODES } from "../../../shared/findingCodes.js";

const fakeScore = 72;
const fakeContext = buildSafeAIContext({
  score: fakeScore,
  riskLevel: "medium",
  findings: [
    { code: FINDING_CODES.HSTS_MISSING },
    { code: FINDING_CODES.CSP_MISSING }
  ],
  answers: {
    APP_HAS_LOGIN: true,
    HAS_ADMIN_AREA: false
  }
});

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

// Day 29 lightweight grounding smoke check. Full production output validation
// belongs to Day 31.
try {
  const parsed = JSON.parse(result.content);
  if (parsed.score !== fakeScore) {
    throw new Error("Model changed the deterministic score.");
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
