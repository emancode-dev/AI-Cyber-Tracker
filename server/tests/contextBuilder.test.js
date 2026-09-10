import test from "node:test";
import assert from "node:assert/strict";
import {
  assertSafeAIContext,
  buildSafeAIContext
} from "../src/ai/contextBuilder.js";
import { calculateScore } from "../src/risk/calculateScore.js";

function makeAnalysis(findings, answers) {
  return calculateScore(findings, answers, {
    scopeCoveragePercent: 42,
    independentlyObservedPercent: 42,
    untestedAreas: ["server-side authorization correctness"]
  });
}

test("AI context keeps only minimized allowlisted fields and safe deterministic metadata", () => {
  const findings = [
    {
      code: "HSTS_MISSING",
      category: "headers",
      severity: "medium",
      status: "needs_attention",
      remediation: "Add HSTS after confirming HTTPS readiness.",
      verification: "Rescan and confirm the header is present.",
      standards: { owaspTop10: ["A02:2025"], asvs: ["v5.0.0-3.4.1"], wstg: [] },
      evidenceSummary: "This must not be forwarded",
      headers: { authorization: "secret" }
    }
  ];
  const answers = {
    APP_HAS_LOGIN: true,
    PASSWORD_RESET_REVIEWED: false,
    CHANGE_REVIEW_PROCESS: true
  };

  const context = buildSafeAIContext({
    analysis: makeAnalysis(findings, answers),
    findings,
    answers
  });

  assert.deepEqual(Object.keys(context), [
    "score",
    "riskLevel",
    "contextRiskLevel",
    "overallPriority",
    "findingCodes",
    "priorityFindingCodes",
    "reviewFindingCodes",
    "roadmapFindingCodes",
    "findingFacts",
    "contextCodes",
    "contextFacts",
    "questionnaire",
    "coverage"
  ]);
  const serialized = JSON.stringify(context);
  assert.equal(serialized.includes("evidenceSummary"), false);
  assert.equal(serialized.includes("This must not be forwarded"), false);
  assert.equal(serialized.includes("secret"), false);
  assert.equal(context.questionnaire.APP_HAS_LOGIN, true);
  assert.equal(context.questionnaire.PASSWORD_RESET_REVIEWED, false);
  assert.equal(Object.prototype.hasOwnProperty.call(context.questionnaire, "CHANGE_REVIEW_PROCESS"), false);
  assert.equal(context.findingFacts[0].code, "HSTS_MISSING");
  assert.equal(context.coverage.scopeCoveragePercent, 42);
  assert.equal(assertSafeAIContext(context), true);
});

test("unexpected sensitive structural fields are rejected", () => {
  assert.throws(() =>
    assertSafeAIContext({
      score: 80,
      riskLevel: "low",
      contextRiskLevel: "low",
      overallPriority: "low",
      findingCodes: [],
      findingFacts: [],
      questionnaire: {},
      coverage: null,
      rawCookie: "secret"
    })
  );
});
