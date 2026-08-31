import test from "node:test";
import assert from "node:assert/strict";
import {
  assertSafeAIContext,
  buildSafeAIContext
} from "../src/ai/contextBuilder.js";

test("AI context keeps only minimized allowlisted fields", () => {
  const context = buildSafeAIContext({
    score: 72,
    riskLevel: "medium",
    findings: [
      {
        code: "HSTS_MISSING",
        evidenceSummary: "This must not be forwarded",
        headers: { authorization: "secret" }
      }
    ],
    answers: {
      APP_HAS_LOGIN: true,
      PASSWORD_RESET_REVIEWED: false,
      CHANGE_REVIEW_PROCESS: true
    }
  });

  assert.deepEqual(Object.keys(context), [
    "score",
    "riskLevel",
    "findingCodes",
    "questionnaire"
  ]);
  assert.equal(JSON.stringify(context).includes("evidenceSummary"), false);
  assert.equal(JSON.stringify(context).includes("authorization"), false);
  assert.equal(context.questionnaire.APP_HAS_LOGIN, true);
  assert.equal(context.questionnaire.PASSWORD_RESET_REVIEWED, false);
  assert.equal(Object.prototype.hasOwnProperty.call(context.questionnaire, "CHANGE_REVIEW_PROCESS"), false);
  assert.equal(assertSafeAIContext(context), true);
});

test("unexpected sensitive structural fields are rejected", () => {
  assert.throws(() =>
    assertSafeAIContext({
      score: 80,
      riskLevel: "low",
      findingCodes: [],
      questionnaire: {},
      rawCookie: "secret"
    })
  );
});
