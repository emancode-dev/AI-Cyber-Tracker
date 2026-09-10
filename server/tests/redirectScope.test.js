import test from "node:test";
import assert from "node:assert/strict";
import { isRedirectHostInScope } from "../src/scanner/safeRequest.js";

test("redirect scope permits same host and the common apex/www canonical pair", () => {
  assert.equal(isRedirectHostInScope("https://example.com/", "https://example.com/login"), true);
  assert.equal(isRedirectHostInScope("https://example.com/", "https://www.example.com/"), true);
  assert.equal(isRedirectHostInScope("https://www.example.com/", "https://example.com/"), true);
});

test("redirect scope rejects a different host or subdomain", () => {
  assert.equal(isRedirectHostInScope("https://example.com/", "https://accounts.example.com/"), false);
  assert.equal(isRedirectHostInScope("https://example.com/", "https://example.net/"), false);
  assert.equal(isRedirectHostInScope("https://example.com/", "https://www.evil-example.com/"), false);
});
