import { FINDING_CODES } from "../../../shared/findingCodes.js";
import { createFinding } from "./normalizeFindings.js";

function presentOrMissing({ present, presentCode, missingCode, title, category = "headers", severity = "medium", whyItMatters }) {
  return createFinding({ code: present ? presentCode : missingCode, category, severity: present ? "info" : severity, status: present ? "passed" : "needs_attention", confidence: "high", type: "configuration", title: `${title} ${present ? "observed" : "not observed"}`, evidenceSummary: `${title} was ${present ? "observed" : "not observed"} in the final HTTP response headers.`, whyItMatters });
}

// Eman's cross-teach scanner check: a single clear header rule that follows the shared finding shape.
export function checkHsts(headers, isHttps) {
  if (!isHttps) return null;
  return presentOrMissing({ present: Boolean(headers["strict-transport-security"]), presentCode: FINDING_CODES.HSTS_PRESENT, missingCode: FINDING_CODES.HSTS_MISSING, title: "HSTS", severity: "medium", whyItMatters: "HSTS tells supporting browsers to keep using HTTPS for this host after a secure visit." });
}

export function scanHeaders(headers, finalUrl) {
  const isHttps = new URL(finalUrl).protocol === "https:";
  const csp = String(headers["content-security-policy"] || "");
  const frameProtected = /frame-ancestors/i.test(csp) || Boolean(headers["x-frame-options"]);
  const serverDisclosure = Boolean(headers["x-powered-by"]) || /\d/.test(String(headers.server || ""));
  return [
    presentOrMissing({ present: Boolean(csp), presentCode: FINDING_CODES.CSP_PRESENT, missingCode: FINDING_CODES.CSP_MISSING, title: "Content Security Policy", whyItMatters: "A well-designed CSP can reduce the impact of some content-injection attacks." }),
    checkHsts(headers, isHttps),
    presentOrMissing({ present: String(headers["x-content-type-options"] || "").toLowerCase() === "nosniff", presentCode: FINDING_CODES.X_CONTENT_TYPE_OPTIONS_PRESENT, missingCode: FINDING_CODES.X_CONTENT_TYPE_OPTIONS_MISSING, title: "X-Content-Type-Options nosniff", severity: "low", whyItMatters: "The nosniff directive reduces browser MIME-type guessing for some responses." }),
    presentOrMissing({ present: Boolean(headers["referrer-policy"]), presentCode: FINDING_CODES.REFERRER_POLICY_PRESENT, missingCode: FINDING_CODES.REFERRER_POLICY_MISSING, title: "Referrer-Policy", severity: "low", whyItMatters: "Referrer-Policy helps control how much navigation context is sent to other origins." }),
    presentOrMissing({ present: frameProtected, presentCode: FINDING_CODES.FRAME_PROTECTION_PRESENT, missingCode: FINDING_CODES.FRAME_PROTECTION_MISSING, title: "Frame protection", severity: "medium", whyItMatters: "Frame restrictions can reduce clickjacking exposure when configured correctly." }),
    presentOrMissing({ present: Boolean(headers["permissions-policy"]), presentCode: FINDING_CODES.PERMISSIONS_POLICY_PRESENT, missingCode: FINDING_CODES.PERMISSIONS_POLICY_MISSING, title: "Permissions-Policy", severity: "low", whyItMatters: "Permissions-Policy can limit access to selected browser features." }),
    createFinding({ code: serverDisclosure ? FINDING_CODES.SERVER_DISCLOSURE_PRESENT : FINDING_CODES.SERVER_DISCLOSURE_NOT_OBSERVED, category: "exposure", severity: serverDisclosure ? "low" : "info", status: serverDisclosure ? "manual_review" : "passed", confidence: "medium", type: "observation", title: serverDisclosure ? "Possible server/version disclosure" : "No obvious server/version disclosure", evidenceSummary: serverDisclosure ? "A public response header appears to reveal server technology or a version." : "No obvious version-bearing Server/X-Powered-By header was observed.", whyItMatters: "Technology disclosure is usually not a vulnerability by itself, but unnecessary version details can make targeted reconnaissance easier." })
  ].filter(Boolean);
}
