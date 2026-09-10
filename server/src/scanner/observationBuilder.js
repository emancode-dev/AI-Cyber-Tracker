function observation(kind, key, status, source, details = {}) { return { kind, key, status, source, details }; }
function hasHeader(headers, name) { return Boolean(headers[name]); }
function cookieList(headers) { if (Array.isArray(headers["set-cookie"])) return headers["set-cookie"]; return headers["set-cookie"] ? [headers["set-cookie"]] : []; }

export function buildPrimaryResponseObservations(response, classification = { representative: true, reason: "unknown" }) {
  const headers = response.headers || {};
  const cookies = cookieList(headers);
  const csp = String(headers["content-security-policy"] || "");
  const referrerPolicy = String(headers["referrer-policy"] || "").toLowerCase();
  const hsts = String(headers["strict-transport-security"] || "");
  const maxAgeMatch = /(?:^|;)\s*max-age\s*=\s*(\d+)/i.exec(hsts);
  const maxAge = maxAgeMatch ? Number.parseInt(maxAgeMatch[1], 10) : null;
  const docStatus = classification.representative ? "observed" : "not_tested";

  return [
    observation("http", "final_protocol", "observed", "final_response", { protocol: new URL(response.requestedUrl).protocol.replace(":", "") }),
    observation("http", "status_code", "observed", "final_response", { statusCode: response.statusCode }),
    observation("header", "content-security-policy", classification.representative ? (hasHeader(headers, "content-security-policy") ? "observed" : "not_observed") : "not_tested", "final_response"),
    observation("header", "strict-transport-security", hsts ? "observed" : "not_observed", "final_response", hsts ? { maxAgeSeconds: maxAge } : {}),
    observation("header", "x-content-type-options", classification.representative ? (hasHeader(headers, "x-content-type-options") ? "observed" : "not_observed") : "not_tested", "final_response"),
    observation("header", "referrer-policy", classification.representative ? (referrerPolicy ? "observed" : "not_observed") : "not_tested", "final_response"),
    observation("header", "frame-control-signal", classification.representative ? (/frame-ancestors/i.test(csp) || hasHeader(headers, "x-frame-options") ? "observed" : "not_observed") : "not_tested", "final_response", { cspFrameAncestorsPresent: /(?:^|;)\s*frame-ancestors\s+/i.test(csp), xFrameOptionsPresent: hasHeader(headers, "x-frame-options") }),
    observation("header", "permissions-policy", classification.representative ? (hasHeader(headers, "permissions-policy") ? "observed" : "not_observed") : "not_tested", "final_response"),
    observation("header", "cross-origin-opener-policy", classification.representative ? (hasHeader(headers, "cross-origin-opener-policy") ? "observed" : "not_observed") : "not_tested", "final_response"),
    observation("cookie", "set-cookie", classification.representative ? (cookies.length ? "observed" : "not_observed") : "not_tested", "final_response", { count: cookies.length }),
    observation("html", "form", docStatus === "observed" ? (/<form\b/i.test(response.body || "") ? "observed" : "not_observed") : "not_tested", "final_response"),
    observation("html", "password-field", docStatus === "observed" ? (/<input\b[^>]*type\s*=\s*["']?password/i.test(response.body || "") ? "observed" : "not_observed") : "not_tested", "final_response")
  ];
}
