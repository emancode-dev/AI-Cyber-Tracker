import { FINDING_CODES } from "../../../shared/findingCodes.js";
import { createFinding } from "./normalizeFindings.js";

function cookieName(cookie) {
  return String(cookie || "").split(";", 1)[0].split("=", 1)[0].trim().toLowerCase();
}

function parseCookie(cookie) {
  const parts = String(cookie || "").split(";").map((part) => part.trim()).filter(Boolean);
  const name = cookieName(cookie);
  const attrs = new Map();
  for (const part of parts.slice(1)) {
    const [rawKey, ...rest] = part.split("=");
    attrs.set(rawKey.toLowerCase(), rest.length ? rest.join("=").trim() : true);
  }
  const sameSiteRaw = attrs.get("samesite");
  const sameSite = typeof sameSiteRaw === "string" ? sameSiteRaw.toLowerCase() : null;
  const secure = attrs.get("secure") === true;
  const httpOnly = attrs.get("httponly") === true;
  const validSameSite = ["strict", "lax", "none"].includes(sameSite);
  const authLike = /(^|[-_])(session|sess|auth|token|sid|jwt|csrf|xsrf)([-_]|$)/i.test(name);
  const preferenceLike = /(^|[-_])(pref|preference|theme|locale|lang|consent)([-_]|$)/i.test(name);
  return { secure, httpOnly, sameSite, validSameSite, authLike, preferenceLike };
}

function finding({ code, label, cookieCount, count, actionable, why, invalid = false }) {
  const status = count === 0 ? "passed" : actionable ? "needs_attention" : "manual_review";
  return createFinding({
    code: count === 0 ? code.present : code.missing,
    category: "cookies",
    severity: count === 0 ? "info" : actionable ? "medium" : "low",
    status,
    confidence: actionable ? "high" : "medium",
    type: "configuration",
    observationStatus: count === 0 ? "observed" : invalid ? "inconclusive" : "observed",
    title: `${label} cookie attribute ${count === 0 ? "observed" : actionable ? "needs attention" : "needs contextual review"}`,
    evidenceSummary: count === 0
      ? `All ${cookieCount} visible Set-Cookie header(s) met the scanner's ${label} check.`
      : `${count} of ${cookieCount} visible Set-Cookie header(s) triggered the ${label} check. Cookie names and values were not stored.`,
    whyItMatters: why,
    evidence: { cookieCount, affectedCount: count, attribute: label, contextual: !actionable }
  });
}

export function scanCookies(headers, { representative = true } = {}) {
  const cookies = Array.isArray(headers["set-cookie"]) ? headers["set-cookie"] : headers["set-cookie"] ? [headers["set-cookie"]] : [];
  if (!cookies.length) return [createFinding({ code: FINDING_CODES.COOKIES_NOT_OBSERVED, category: "cookies", severity: "info", status: "observed", confidence: "high", type: "observation", title: "No Set-Cookie header observed", evidenceSummary: "The final response did not set a visible cookie.", whyItMatters: "This is only an observation. Other pages or later requests may still set cookies." })];
  if (!representative) return [createFinding({ code: FINDING_CODES.COOKIE_POSTURE_INCONCLUSIVE, category: "cookies", severity: "info", status: "manual_review", confidence: "medium", type: "observation", observationStatus: "inconclusive", title: "Cookie posture not scored on this response", evidenceSummary: `${cookies.length} Set-Cookie header(s) were visible on a non-representative response, so they were not treated as the application's normal cookie posture.`, whyItMatters: "Challenge/error responses can set infrastructure cookies that do not represent application sessions.", evidence: { cookieCount: cookies.length, representativeResponse: false } })];

  const parsed = cookies.map(parseCookie);
  const secureMissing = parsed.filter((item) => !item.secure).length;
  const httpOnlyAuthMissing = parsed.filter((item) => item.authLike && !item.httpOnly).length;
  const httpOnlyUnknownMissing = parsed.filter((item) => !item.authLike && !item.preferenceLike && !item.httpOnly).length;
  const sameSiteAuthMissing = parsed.filter((item) => item.authLike && !item.validSameSite).length;
  const sameSiteUnknownMissing = parsed.filter((item) => !item.authLike && !item.validSameSite).length;

  return [
    finding({ code: { present: FINDING_CODES.COOKIE_SECURE_PRESENT, missing: FINDING_CODES.COOKIE_SECURE_MISSING }, label: "Secure", cookieCount: cookies.length, count: secureMissing, actionable: secureMissing > 0, why: "Secure limits cookies to HTTPS transport." }),
    finding({ code: { present: FINDING_CODES.COOKIE_HTTPONLY_PRESENT, missing: FINDING_CODES.COOKIE_HTTPONLY_MISSING }, label: "HttpOnly", cookieCount: cookies.length, count: httpOnlyAuthMissing + httpOnlyUnknownMissing, actionable: httpOnlyAuthMissing > 0, why: "HttpOnly is especially important for session/authentication cookies whose values do not need browser JavaScript access." }),
    finding({ code: { present: FINDING_CODES.COOKIE_SAMESITE_PRESENT, missing: FINDING_CODES.COOKIE_SAMESITE_MISSING }, label: "SameSite", cookieCount: cookies.length, count: sameSiteAuthMissing + sameSiteUnknownMissing, actionable: sameSiteAuthMissing > 0, why: "SameSite affects cross-site cookie delivery and is particularly relevant to authentication/CSRF-sensitive flows.", invalid: parsed.some((item) => item.sameSite && !item.validSameSite) })
  ];
}
