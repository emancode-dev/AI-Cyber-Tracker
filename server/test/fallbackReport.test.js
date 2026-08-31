import test from "node:test";
import assert from "node:assert/strict";
import { buildFallbackReport } from "../src/ai/fallbackReport.js";

test("builds a deterministic report when the AI provider is unavailable", () => {
  const report = buildFallbackReport({
    score: 64,
    prioritizedFindings: [
      { code: "HTTPS_MISSING", title: "HTTPS missing", penalty: 20 },
      { code: "CSP_MISSING", title: "CSP missing", penalty: 10 }
    ]
  });
  assert.equal(report.score, 64);
  assert.deepEqual(report.priorities.map((item) => item.findingCode), ["HTTPS_MISSING", "CSP_MISSING"]);
  assert.equal(report.roadmap.today.length, 2);
});
