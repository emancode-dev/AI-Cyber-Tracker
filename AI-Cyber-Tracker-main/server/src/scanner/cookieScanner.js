import { FINDING_CODES } from "../../../shared/findingCodes.js";
import { createFinding } from "./normalizeFindings.js";

function countMissing(cookies, token) { return cookies.filter((cookie) => !cookie.toLowerCase().includes(token)).length; }

export function scanCookies(headers) {
  const cookies = Array.isArray(headers["set-cookie"]) ? headers["set-cookie"] : headers["set-cookie"] ? [headers["set-cookie"]] : [];
  if (!cookies.length) return [createFinding({ code: FINDING_CODES.COOKIES_NOT_OBSERVED, category: "cookies", severity: "info", status: "observed", confidence: "high", type: "observation", title: "No Set-Cookie header observed", evidenceSummary: "The final response did not set a visible cookie.", whyItMatters: "This is only an observation. Other pages or later requests may still set cookies." })];

  const checks = [
    ["; secure", FINDING_CODES.COOKIE_SECURE_PRESENT, FINDING_CODES.COOKIE_SECURE_MISSING, "Secure", "The Secure attribute limits a cookie to HTTPS requests."],
    ["; httponly", FINDING_CODES.COOKIE_HTTPONLY_PRESENT, FINDING_CODES.COOKIE_HTTPONLY_MISSING, "HttpOnly", "HttpOnly prevents normal client-side JavaScript APIs from reading the cookie."],
    ["; samesite=", FINDING_CODES.COOKIE_SAMESITE_PRESENT, FINDING_CODES.COOKIE_SAMESITE_MISSING, "SameSite", "SameSite influences when a browser sends the cookie in cross-site contexts."]
  ];

  return checks.map(([token, presentCode, missingCode, label, why]) => {
    const missing = countMissing(cookies, token);
    const present = missing === 0;
    return createFinding({ code: present ? presentCode : missingCode, category: "cookies", severity: present ? "info" : "medium", status: present ? "passed" : "needs_attention", confidence: "high", type: "configuration", title: `${label} cookie attribute ${present ? "observed" : "missing on some cookies"}`, evidenceSummary: present ? `All ${cookies.length} visible Set-Cookie header(s) included ${label}.` : `${missing} of ${cookies.length} visible Set-Cookie header(s) did not include ${label}. Cookie values were not stored in the finding.`, whyItMatters: why });
  });
}
