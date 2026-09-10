import test from "node:test";
import assert from "node:assert/strict";
import { buildReportFingerprint } from "../src/ai/reportFingerprint.js";

const base = {
  scan: { id: "scan-1", answers_revision: 2 },
  analysis: { score: 80, riskLevel: "low", contextRiskLevel: "medium", overallPriority: "medium", coverage: { scopeCoveragePercent: 50 } },
  findings: [{ code: "HSTS_MISSING", severity: "medium", status: "needs_attention", confidence: "high", ruleVersion: "1" }],
  answers: { APP_HAS_LOGIN: true }
};

test("report fingerprint is stable for equivalent inputs regardless of object key order", () => {
  const first = buildReportFingerprint(base);
  const second = buildReportFingerprint({ ...base, answers: { APP_HAS_LOGIN: true } });
  assert.equal(first, second);
});

test("report fingerprint changes when owner answers revision or inputs change", () => {
  const first = buildReportFingerprint(base);
  assert.notEqual(first, buildReportFingerprint({ ...base, scan: { ...base.scan, answers_revision: 3 } }));
  assert.notEqual(first, buildReportFingerprint({ ...base, answers: { APP_HAS_LOGIN: false } }));
});
