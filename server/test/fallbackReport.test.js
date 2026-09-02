import test from "node:test";
import assert from "node:assert/strict";
import { buildFallbackReport } from "../src/ai/fallbackReport.js";

test("builds a deterministic, evidence-grounded report when the AI provider is unavailable", () => {
  const report = buildFallbackReport({
    score: 64,
    contextRiskLevel: "medium",
    prioritizedFindings: [
      { code: "HTTPS_MISSING", title: "HTTPS missing", penalty: 20, remediation: "Enable HTTPS.", verification: "Rescan and confirm HTTPS." },
      { code: "CSP_MISSING", title: "CSP missing", penalty: 10, remediation: "Deploy a CSP.", verification: "Rescan and confirm CSP." }
    ],
    reviewFindings: [],
    contextAdjustments: []
  });
  assert.equal(report.score, 64);
  assert.deepEqual(report.priorities.map((item) => item.findingCode), ["HTTPS_MISSING", "CSP_MISSING"]);
  assert.equal(report.roadmap.today.length, 2);
  assert.deepEqual(report.roadmap.today[0], { sourceType: "finding", sourceCode: "HTTPS_MISSING", action: "Enable HTTPS." });
});
