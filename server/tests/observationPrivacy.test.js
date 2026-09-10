import test from "node:test";
import assert from "node:assert/strict";
import { buildPrimaryResponseObservations } from "../src/scanner/observationBuilder.js";

test("sanitized observations record control facts without persisting cookie values or response body", () => {
  const observations = buildPrimaryResponseObservations({
    requestedUrl: "https://example.test/account?private=value",
    statusCode: 200,
    headers: {
      "strict-transport-security": "max-age=31536000; includeSubDomains",
      "content-security-policy": "default-src 'self'; frame-ancestors 'none'",
      "set-cookie": ["session=SUPER_SECRET_TOKEN; Secure; HttpOnly; SameSite=Lax"]
    },
    body: '<form><input type="password" value="never-store-this"></form>'
  });

  const serialized = JSON.stringify(observations);
  assert.equal(serialized.includes("SUPER_SECRET_TOKEN"), false);
  assert.equal(serialized.includes("never-store-this"), false);
  assert.equal(serialized.includes("private=value"), false);

  const cookie = observations.find((item) => item.kind === "cookie");
  assert.deepEqual(cookie.details, { count: 1 });
});
