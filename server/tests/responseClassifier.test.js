import test from "node:test";
import assert from "node:assert/strict";
import { classifyPrimaryResponse } from "../src/scanner/responseClassifier.js";

test("normal 2xx HTML is representative", () => {
  assert.equal(classifyPrimaryResponse({ statusCode: 200, headers: { "content-type": "text/html" }, body: "<html>ok</html>" }).representative, true);
});

test("403, 429, 5xx, unresolved redirects and JSON are non-representative", () => {
  for (const sample of [
    { statusCode: 403, headers: { "content-type": "text/html" }, body: "denied" },
    { statusCode: 429, headers: { "content-type": "text/html" }, body: "slow down" },
    { statusCode: 503, headers: { "content-type": "text/html" }, body: "down" },
    { statusCode: 302, headers: { "content-type": "text/html" }, body: "redirect" },
    { statusCode: 200, headers: { "content-type": "application/json" }, body: "{}" }
  ]) assert.equal(classifyPrimaryResponse(sample).representative, false);
});

test("challenge-like HTML is non-representative even with status 200", () => {
  const result = classifyPrimaryResponse({ statusCode: 200, headers: { "content-type": "text/html" }, body: "<html>Just a moment... checking your browser</html>" });
  assert.equal(result.representative, false);
  assert.equal(result.reason, "challenge_page");
});
