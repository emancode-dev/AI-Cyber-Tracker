import test from "node:test";
import assert from "node:assert/strict";
import { classifyFindingLifecycle, summarizeLifecycle } from "../src/services/findingLifecycleService.js";

const finding = (code, status = "needs_attention") => ({
  code,
  category: "headers",
  severity: "medium",
  status,
  title: code
});

test("lifecycle distinguishes new, existing, resolved, and regressed findings when methodology is comparable", () => {
  const previous = [
    { finding_code: "CSP_MISSING", category: "headers", severity: "medium", title: "CSP", lifecycle_state: "existing" },
    { finding_code: "HSTS_MISSING", category: "headers", severity: "medium", title: "HSTS", lifecycle_state: "resolved" },
    { finding_code: "X_CONTENT_TYPE_OPTIONS_MISSING", category: "headers", severity: "low", title: "nosniff", lifecycle_state: "existing" }
  ];

  const current = [
    finding("CSP_MISSING"),
    finding("HSTS_MISSING"),
    finding("REFERRER_POLICY_MISSING"),
    finding("COOKIES_NOT_OBSERVED", "passed")
  ];

  const events = classifyFindingLifecycle(previous, current);
  const states = Object.fromEntries(events.map((event) => [event.finding.code, event.lifecycleState]));

  assert.equal(states.CSP_MISSING, "existing");
  assert.equal(states.HSTS_MISSING, "regressed");
  assert.equal(states.REFERRER_POLICY_MISSING, "new");
  assert.equal(states.X_CONTENT_TYPE_OPTIONS_MISSING, "resolved");
  assert.equal(Object.prototype.hasOwnProperty.call(states, "COOKIES_NOT_OBSERVED"), false);
  assert.deepEqual(summarizeLifecycle(events), { baseline: 0, new: 1, existing: 1, resolved: 1, regressed: 1 });
});

test("incomparable methodology creates a fresh baseline without false resolved or regressed claims", () => {
  const previous = [
    { finding_code: "OLD_RULE", category: "headers", severity: "medium", title: "Old rule", lifecycle_state: "existing" }
  ];
  const current = [finding("CSP_MISSING"), finding("HSTS_MISSING"), finding("INFO_ONLY", "passed")];

  const events = classifyFindingLifecycle(previous, current, { methodologyComparable: false });
  const states = Object.fromEntries(events.map((event) => [event.finding.code, event.lifecycleState]));

  assert.deepEqual(states, { CSP_MISSING: "baseline", HSTS_MISSING: "baseline" });
  assert.deepEqual(summarizeLifecycle(events), { baseline: 2, new: 0, existing: 0, resolved: 0, regressed: 0 });
});
