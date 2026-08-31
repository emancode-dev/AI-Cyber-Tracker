import test from "node:test";
import assert from "node:assert/strict";
import { validateAIReport } from "../src/ai/validateAIReport.js";

const validReport = {
  summary: "Resolve the verified transport finding, then rescan.",
  score: 72,
  priorities: [{ findingCode: "HTTPS_MISSING", explanation: "Traffic is not protected in transit." }],
  roadmap: { today: ["Enable HTTPS in staging."], thisWeek: [], thisMonth: [] },
  manualReview: [{ findingCode: "HTTPS_MISSING", reason: "Confirm redirects and certificate coverage." }]
};

test("accepts a score-locked report containing only supplied finding codes", () => {
  const result = validateAIReport(validReport, { score: 72, allowedFindingCodes: ["HTTPS_MISSING"] });
  assert.equal(result.score, 72);
  assert.equal(result.priorities[0].findingCode, "HTTPS_MISSING");
});

test("rejects an AI attempt to change the deterministic score", () => {
  assert.throws(
    () => validateAIReport({ ...validReport, score: 99 }, { score: 72, allowedFindingCodes: ["HTTPS_MISSING"] }),
    /changed the deterministic score/
  );
});

test("rejects finding codes not present in verified scanner context", () => {
  const injected = { ...validReport, priorities: [{ findingCode: "MADE_UP_FINDING", explanation: "Invented." }] };
  assert.throws(
    () => validateAIReport(injected, { score: 72, allowedFindingCodes: ["HTTPS_MISSING"] }),
    /unknown finding/
  );
});
