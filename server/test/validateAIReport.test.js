import test from "node:test";
import assert from "node:assert/strict";
import { validateAIReport } from "../src/ai/validateAIReport.js";

const validReport = {
  summary: "Resolve the verified transport finding, then rescan.",
  score: 72,
  priorities: [{ findingCode: "HTTPS_MISSING", explanation: "Traffic is not protected in transit." }],
  roadmap: {
    today: [{ sourceType: "finding", sourceCode: "HTTPS_MISSING", action: "Enable HTTPS in staging." }],
    thisWeek: [{ sourceType: "owner_context", sourceCode: "CTX_ADMIN_MFA_MISSING", action: "Enable MFA for administrators." }],
    thisMonth: []
  },
  manualReview: [{ findingCode: "POTENTIAL_DEBUG_EXPOSURE", reason: "Confirm whether the observed text reflects a real production debug response." }]
};

const options = { score: 72, allowedFindingCodes: ["HTTPS_MISSING", "HTTPS_PRESENT", "POTENTIAL_DEBUG_EXPOSURE"], allowedPriorityFindingCodes: ["HTTPS_MISSING"], allowedReviewFindingCodes: ["POTENTIAL_DEBUG_EXPOSURE"], allowedRoadmapFindingCodes: ["HTTPS_MISSING", "POTENTIAL_DEBUG_EXPOSURE"], allowedContextCodes: ["CTX_ADMIN_MFA_MISSING"] };

test("accepts a score-locked report containing only supplied finding/context codes", () => {
  const result = validateAIReport(validReport, options);
  assert.equal(result.score, 72);
  assert.equal(result.priorities[0].findingCode, "HTTPS_MISSING");
  assert.equal(result.roadmap.thisWeek[0].sourceCode, "CTX_ADMIN_MFA_MISSING");
});

test("rejects an AI attempt to change the deterministic score", () => {
  assert.throws(() => validateAIReport({ ...validReport, score: 99 }, options), /changed the deterministic score/);
});

test("rejects finding codes not present in verified scanner context", () => {
  const injected = { ...validReport, priorities: [{ findingCode: "MADE_UP_FINDING", explanation: "Invented." }] };
  assert.throws(() => validateAIReport(injected, options), /unknown finding/);
});

test("rejects ungrounded roadmap owner-context codes", () => {
  const injected = {
    ...validReport,
    roadmap: { ...validReport.roadmap, thisWeek: [{ sourceType: "owner_context", sourceCode: "CTX_FAKE", action: "Invented." }] }
  };
  assert.throws(() => validateAIReport(injected, options), /unknown owner-context source/);
});


test("rejects passed findings as AI priorities even when the finding exists", () => {
  const injected = { ...validReport, priorities: [{ findingCode: "HTTPS_PRESENT", explanation: "Do something." }] };
  assert.throws(() => validateAIReport(injected, options), /not eligible for priority/);
});

test("rejects non-review findings from manualReview", () => {
  const injected = { ...validReport, manualReview: [{ findingCode: "HTTPS_MISSING", reason: "Review it." }] };
  assert.throws(() => validateAIReport(injected, options), /not eligible for manual review/);
});
