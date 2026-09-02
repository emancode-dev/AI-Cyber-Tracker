import test from "node:test";
import assert from "node:assert/strict";
import { scanCookies } from "../src/scanner/cookieScanner.js";
import { FINDING_CODES } from "../../shared/findingCodes.js";

function codes(headers) {
  return new Map(scanCookies(headers).map((finding) => [finding.code, finding]));
}

test("cookie attributes are recognized regardless of spacing and letter case", () => {
  const findings = codes({
    "set-cookie": ["session=value;Secure;HTTPONLY;SameSite=Lax"]
  });
  assert.ok(findings.has(FINDING_CODES.COOKIE_SECURE_PRESENT));
  assert.ok(findings.has(FINDING_CODES.COOKIE_HTTPONLY_PRESENT));
  assert.ok(findings.has(FINDING_CODES.COOKIE_SAMESITE_PRESENT));
});

test("cookie findings record only counts/attribute metadata and never cookie values", () => {
  const findings = scanCookies({
    "set-cookie": ["session=TOP_SECRET; Secure", "prefs=PRIVATE_VALUE; SameSite=Lax"]
  });
  const serialized = JSON.stringify(findings);
  assert.equal(serialized.includes("TOP_SECRET"), false);
  assert.equal(serialized.includes("PRIVATE_VALUE"), false);
  assert.ok(findings.some((finding) => finding.code === FINDING_CODES.COOKIE_HTTPONLY_MISSING));
});

test("boolean-looking cookie attribute values do not masquerade as flags", () => {
  const findings = codes({ "set-cookie": ["session=value; Secure=false; HttpOnly=0; SameSite=Banana"] });
  assert.ok(findings.has(FINDING_CODES.COOKIE_SECURE_MISSING));
  assert.ok(findings.has(FINDING_CODES.COOKIE_HTTPONLY_MISSING));
  assert.ok(findings.has(FINDING_CODES.COOKIE_SAMESITE_MISSING));
});

test("preference cookie without HttpOnly is contextual review, not confirmed vulnerability", () => {
  const findings = codes({ "set-cookie": ["theme=dark; Secure; SameSite=Lax"] });
  const item = findings.get(FINDING_CODES.COOKIE_HTTPONLY_PRESENT);
  assert.ok(item, "preference cookie does not require HttpOnly by default");
});

test("unknown cookie missing HttpOnly is manual review and does not expose its name/value", () => {
  const findings = scanCookies({ "set-cookie": ["mystery=SECRET; Secure; SameSite=Lax"] });
  const item = findings.find((finding) => finding.code === FINDING_CODES.COOKIE_HTTPONLY_MISSING);
  assert.equal(item.status, "manual_review");
  assert.equal(JSON.stringify(findings).includes("SECRET"), false);
  assert.equal(JSON.stringify(findings).includes("mystery"), false);
});


test("cookies observed on a non-representative response use an inconclusive code rather than claiming no cookies were observed", () => {
  const findings = scanCookies({ "set-cookie": ["edge_session=opaque; Secure; HttpOnly; SameSite=Lax"] }, { representative: false });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].code, FINDING_CODES.COOKIE_POSTURE_INCONCLUSIVE);
  assert.equal(findings[0].observationStatus, "inconclusive");
  assert.equal(findings[0].evidence.cookieCount, 1);
});
