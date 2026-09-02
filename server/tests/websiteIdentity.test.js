import test from "node:test";
import assert from "node:assert/strict";
import { createWebsite, normalizeTarget } from "../src/services/websiteService.js";

test("website target normalization is stable for equivalent canonical URLs", () => {
  assert.deepEqual(normalizeTarget("https://Example.com"), { url: "https://example.com/", domain: "example.com" });
});

test("assessment identity distinguishes a different path or hostname", () => {
  const base = normalizeTarget("https://example.com/");
  assert.notEqual(normalizeTarget("https://example.com/app").url, base.url);
  assert.notEqual(normalizeTarget("https://www.example.com/").url, base.url);
});

test("website target identity rejects embedded credentials and canonicalizes a trailing DNS dot", () => {
  assert.throws(() => normalizeTarget("https://user:secret@example.com/"), /embedded credentials/i);
  assert.deepEqual(normalizeTarget("https://Example.com./"), { url: "https://example.com/", domain: "example.com" });
});


test("website creation enforces authorization confirmation at the service boundary", async () => {
  await assert.rejects(
    () => createWebsite(null, "user-1", { name: "Example", url: "https://example.com", authorizationConfirmed: false }),
    (error) => error?.statusCode === 400 && error?.code === "SCAN_AUTHORIZATION_REQUIRED"
  );
});
