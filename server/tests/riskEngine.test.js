import test from "node:test";
import assert from "node:assert/strict";
import { calculateScore } from "../src/risk/calculateScore.js";
import { secureish, medium, highRisk } from "./fixtures/riskFixtures.js";

test("same input always produces exactly the same deterministic result", () => {
  const first = calculateScore(medium.findings, medium.answers);
  const second = calculateScore(medium.findings, medium.answers);
  assert.deepEqual(first, second);
});

test("secure-ish scanner evidence scores above medium scanner evidence", () => {
  const secureScore = calculateScore(secureish.findings, secureish.answers);
  const mediumScore = calculateScore(medium.findings, medium.answers);
  assert.ok(secureScore.score > mediumScore.score);
  assert.equal(secureScore.riskLevel, "low");
});

test("high-risk scanner evidence receives a high external risk level", () => {
  const result = calculateScore(highRisk.findings, highRisk.answers);
  assert.equal(result.riskLevel, "high");
  assert.ok(result.contextPenalty > 0);
});

test("owner context changes contextual risk but never changes external posture score", () => {
  const withoutLogin = calculateScore(medium.findings, {
    ...medium.answers,
    APP_HAS_LOGIN: false
  });
  const withLogin = calculateScore(medium.findings, medium.answers);

  assert.equal(withLogin.score, withoutLogin.score);
  assert.ok(withLogin.contextPenalty > withoutLogin.contextPenalty);
});

test("manual-review uncertainty is surfaced but does not lower the external score", () => {
  const result = calculateScore([{ code: "SERVER_DISCLOSURE_PRESENT", category: "exposure", severity: "medium", status: "manual_review", confidence: "low", title: "Possible disclosure", whyItMatters: "Review it." }], {});
  assert.equal(result.score, 100);
  assert.equal(result.scannerPenalty, 0);
  assert.equal(result.reviewFindings.length, 1);
});

test("owner context does not convert a manual-review cookie heuristic into a deterministic context penalty", () => {
  const result = calculateScore([{ code: "COOKIE_HTTPONLY_MISSING", category: "cookies", severity: "low", status: "manual_review", confidence: "medium", title: "Cookie needs review" }], { APP_HAS_LOGIN: true });
  assert.equal(result.score, 100);
  assert.equal(result.contextPenalty, 0);
});
