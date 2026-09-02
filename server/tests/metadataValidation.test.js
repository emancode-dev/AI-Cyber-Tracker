import test from "node:test";
import assert from "node:assert/strict";
import { validateMetadataContent } from "../src/scanner/metadataScanner.js";

function response(body, contentType = "text/plain") {
  return { body, headers: { "content-type": contentType } };
}

test("robots.txt requires recognizable robots directives instead of any 200 text", () => {
  assert.equal(validateMetadataContent("/robots.txt", response("User-agent: *\nDisallow: /admin")), true);
  assert.equal(validateMetadataContent("/robots.txt", response("<html>normal SPA homepage</html>", "text/html")), false);
});

test("sitemap.xml requires XML sitemap structure", () => {
  assert.equal(validateMetadataContent("/sitemap.xml", response('<?xml version="1.0"?><urlset></urlset>', "application/xml")), true);
  assert.equal(validateMetadataContent("/sitemap.xml", response("<html>home</html>", "text/html")), false);
});

test("security.txt requires Contact and Expires fields", () => {
  assert.equal(validateMetadataContent("/.well-known/security.txt", response("Contact: mailto:security@example.test\nExpires: 2027-01-01T00:00:00Z")), true);
  assert.equal(validateMetadataContent("/.well-known/security.txt", response("Contact: mailto:security@example.test")), false);
});
