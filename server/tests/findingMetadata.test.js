import test from "node:test";
import assert from "node:assert/strict";
import { scanHeaders } from "../src/scanner/headerScanner.js";
import { FINDING_CODES } from "../../shared/findingCodes.js";


test("actionable findings carry deterministic remediation, verification, standards, source, and rule version", () => {
  const finding = scanHeaders({}, "https://example.test/")
    .find((item) => item.code === FINDING_CODES.CSP_MISSING);

  assert.ok(finding);
  assert.match(finding.remediation, /Content-Security-Policy/i);
  assert.match(finding.verification, /Rescan/i);
  assert.ok(finding.standards.owaspTop10.length > 0);
  assert.ok(finding.standards.asvs.includes("v5.0.0-3.4.3"));
  assert.equal(finding.source, "passive_http");
  assert.ok(finding.ruleVersion);
});
