import test from "node:test";
import assert from "node:assert/strict";
import { canReturnStoredAnalysis } from "../src/services/riskService.js";

test("completed assessment snapshot is authoritative when it matches the persisted score", () => {
  assert.equal(canReturnStoredAnalysis({ status: "completed", score: 81, analysis_snapshot: { score: 81 } }), true);
});

test("snapshot is not used for incomplete, mismatched, or missing historical state", () => {
  assert.equal(canReturnStoredAnalysis({ status: "waiting_for_answers", score: 81, analysis_snapshot: { score: 81 } }), false);
  assert.equal(canReturnStoredAnalysis({ status: "completed", score: 81, analysis_snapshot: { score: 79 } }), false);
  assert.equal(canReturnStoredAnalysis({ status: "completed", score: 81, analysis_snapshot: null }), false);
});
