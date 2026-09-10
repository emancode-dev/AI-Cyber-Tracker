import test from "node:test";
import assert from "node:assert/strict";
import { calculateAssessmentCoverage } from "../src/risk/coverage.js";
import { FINDING_CODES } from "../../shared/findingCodes.js";

const findings = [
  { code: "HTTPS_PRESENT" },
  { code: "TLS_CERT_VALID" },
  { code: "CSP_MISSING" },
  { code: "HSTS_MISSING" },
  { code: "X_CONTENT_TYPE_OPTIONS_PRESENT" },
  { code: "REFERRER_POLICY_PRESENT" },
  { code: "FRAME_PROTECTION_PRESENT" },
  { code: "PERMISSIONS_POLICY_MISSING" },
  { code: "COOP_MISSING" },
  { code: "SERVER_DISCLOSURE_NOT_OBSERVED" },
  { code: "COOKIE_SECURE_PRESENT" },
  { code: "COOKIE_HTTPONLY_PRESENT" },
  { code: "COOKIE_SAMESITE_PRESENT" }
];

test("coverage is explicit scope coverage and never claims percentage-secure", () => {
  const coverage = calculateAssessmentCoverage(findings, {
    progress: { answered: 5, total: 10 }
  });

  assert.equal(coverage.automated.assessed, coverage.automated.total);
  assert.equal(coverage.automated.percent, 100);
  assert.equal(coverage.ownerContext.percent, 50);
  assert.ok(coverage.scopeCoveragePercent > 0 && coverage.scopeCoveragePercent < 100);
  assert.match(coverage.disclaimer, /not the percentage.*secure/i);
  assert.ok(coverage.untestedAreas.includes("server-side authorization correctness"));
});


test("a response with no Set-Cookie header does not claim Secure, HttpOnly, or SameSite coverage", () => {
  const findings = [{ code: FINDING_CODES.COOKIES_NOT_OBSERVED, observationStatus: "not_observed" }];
  const coverage = calculateAssessmentCoverage(findings, { progress: { answered: 0, total: 0 } });
  assert.equal(coverage.automated.assessed, 0);
});
