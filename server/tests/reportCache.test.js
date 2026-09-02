import test from "node:test";
import assert from "node:assert/strict";
import { shouldUseCachedReport } from "../src/services/reportService.js";

test("validated report cache is reusable while a retryable fallback obeys its cooldown", () => {
  const fingerprint = "abc";
  assert.equal(shouldUseCachedReport({ inputFingerprint: fingerprint, retryable: false }, fingerprint, { apiKeyPresent: true, nowMs: 1000 }), true);
  assert.equal(shouldUseCachedReport({ inputFingerprint: fingerprint, retryable: true, retryAfterAt: new Date(5000).toISOString() }, fingerprint, { apiKeyPresent: true, nowMs: 1000 }), true);
  assert.equal(shouldUseCachedReport({ inputFingerprint: fingerprint, retryable: true, retryAfterAt: new Date(500).toISOString() }, fingerprint, { apiKeyPresent: true, nowMs: 1000 }), false);
  assert.equal(shouldUseCachedReport({ inputFingerprint: "other", retryable: false }, fingerprint, { apiKeyPresent: false, nowMs: 1000 }), false);
});
