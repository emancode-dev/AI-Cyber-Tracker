import test from "node:test";
import assert from "node:assert/strict";
import { scanHeaders } from "../src/scanner/headerScanner.js";
import { FINDING_CODES } from "../../shared/findingCodes.js";

function codeMap(headers, url = "https://example.test/") {
  return new Map(scanHeaders(headers, url).map((finding) => [finding.code, finding]));
}

test("CSP frame-ancestors satisfies modern frame protection without X-Frame-Options", () => {
  const findings = codeMap({
    "content-security-policy": "default-src 'self'; frame-ancestors 'none'; object-src 'none'",
    "strict-transport-security": "max-age=31536000",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin"
  });

  assert.ok(findings.has(FINDING_CODES.FRAME_PROTECTION_PRESENT));
  assert.equal(findings.has(FINDING_CODES.FRAME_PROTECTION_MISSING), false);
});

test("X-Frame-Options without CSP frame-ancestors is explicitly classified as legacy-only", () => {
  const findings = codeMap({
    "x-frame-options": "DENY"
  });
  const frame = findings.get(FINDING_CODES.FRAME_PROTECTION_LEGACY_ONLY);
  assert.ok(frame);
  assert.equal(frame.status, "manual_review");
  assert.equal(frame.evidence.mechanism, "x-frame-options-only");
});

test("short HSTS lifetime is flagged instead of being treated as fully passing", () => {
  const findings = codeMap({
    "strict-transport-security": "max-age=300"
  });
  const hsts = findings.get(FINDING_CODES.HSTS_WEAK);
  assert.ok(hsts);
  assert.equal(hsts.evidence.maxAgeSeconds, 300);
  assert.equal(hsts.status, "needs_attention");
});

test("permissive referrer policy is distinguished from missing and strong policy", () => {
  const findings = codeMap({
    "referrer-policy": "unsafe-url"
  });
  assert.ok(findings.has(FINDING_CODES.REFERRER_POLICY_WEAK));
  assert.equal(findings.has(FINDING_CODES.REFERRER_POLICY_MISSING), false);
});

test("missing Permissions-Policy and COOP are manual-review hardening signals, not confirmed vulnerabilities", () => {
  const findings = codeMap({});
  assert.equal(findings.get(FINDING_CODES.PERMISSIONS_POLICY_MISSING)?.status, "manual_review");
  assert.equal(findings.get(FINDING_CODES.COOP_MISSING)?.status, "manual_review");
});

test("wildcard frame-ancestors is not treated as protective", () => {
  const findings = codeMap({ "content-security-policy": "default-src 'self'; frame-ancestors *" });
  assert.ok(findings.has(FINDING_CODES.FRAME_PROTECTION_PERMISSIVE));
  assert.equal(findings.has(FINDING_CODES.FRAME_PROTECTION_PRESENT), false);
});

test("malformed frame-ancestors is inconclusive rather than passed", () => {
  const findings = codeMap({ "content-security-policy": "frame-ancestors 'none' https://example.test" });
  assert.equal(findings.get(FINDING_CODES.FRAME_PROTECTION_INVALID)?.status, "manual_review");
});

test("invalid Referrer-Policy value is not treated as passed", () => {
  const findings = codeMap({ "referrer-policy": "made-up-policy" });
  assert.equal(findings.get(FINDING_CODES.REFERRER_POLICY_INVALID)?.status, "manual_review");
});

test("unsafe-none COOP is a review signal rather than isolation success", () => {
  const findings = codeMap({ "cross-origin-opener-policy": "unsafe-none" });
  assert.equal(findings.get(FINDING_CODES.COOP_WEAK)?.status, "manual_review");
});

test("non-representative responses only retain transport-level header checks", () => {
  const findings = new Map(scanHeaders({}, "https://example.test/", { representative: false }).map((finding) => [finding.code, finding]));
  assert.ok(findings.has(FINDING_CODES.HSTS_MISSING));
  assert.equal(findings.has(FINDING_CODES.CSP_MISSING), false);
});
