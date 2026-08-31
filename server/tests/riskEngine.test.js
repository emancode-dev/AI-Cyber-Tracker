import test from "node:test";
import assert from "node:assert/strict";
import { calculateScore } from "../src/risk/calculateScore.js";
import { secureish, medium, highRisk } from "./fixtures/riskFixtures.js";

test("same input always produces exactly the same deterministic result", () => {
  const first = calculateScore(medium.findings, medium.answers);
  const second = calculateScore(medium.findings, medium.answers);
  assert.deepEqual(first, second);
});

test("secure-ish fixture scores above medium fixture", () => {
  const secureScore = calculateScore(secureish.findings, secureish.answers);
  const mediumScore = calculateScore(medium.findings, medium.answers);
  assert.ok(secureScore.score > mediumScore.score);
  assert.equal(secureScore.riskLevel, "low");
});

test("high-risk fixture receives a high risk level", () => {
  const result = calculateScore(highRisk.findings, highRisk.answers);
  assert.equal(result.riskLevel, "high");
  assert.ok(result.contextPenalty > 0);
});

test("Eman context rule increases penalty for login + missing cookie protection", () => {
  const withoutLogin = calculateScore(medium.findings, {
    ...medium.answers,
    APP_HAS_LOGIN: false
  });
  const withLogin = calculateScore(medium.findings, medium.answers);
  assert.ok(withLogin.contextPenalty > withoutLogin.contextPenalty);
});
