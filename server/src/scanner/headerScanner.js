import { FINDING_CODES } from "../../../shared/findingCodes.js";
import { createFinding } from "./normalizeFindings.js";

function presentOrMissing({ present, presentCode, missingCode, title, category = "headers", severity = "medium", whyItMatters, missingStatus = "needs_attention", presentStatus = "passed", presentTitle = null, presentEvidence = null }) {
  return createFinding({
    code: present ? presentCode : missingCode,
    category,
    severity: present ? "info" : severity,
    status: present ? presentStatus : missingStatus,
    confidence: "high",
    type: "configuration",
    title: present ? (presentTitle || `${title} observed`) : `${title} not observed`,
    evidenceSummary: present ? (presentEvidence || `${title} was observed in the final representative HTTP response headers.`) : `${title} was not observed in the final representative HTTP response headers.`,
    whyItMatters
  });
}

function parseHsts(value) {
  const raw = String(value || "");
  if (!raw) return { present: false, maxAge: null, includeSubDomains: false };
  const match = /(?:^|;)\s*max-age\s*=\s*(\d+)/i.exec(raw);
  return { present: true, maxAge: match ? Number.parseInt(match[1], 10) : null, includeSubDomains: /(?:^|;)\s*includesubdomains(?:\s*;|\s*$)/i.test(raw) };
}

export function checkHsts(headers, isHttps) {
  if (!isHttps) return null;
  const parsed = parseHsts(headers["strict-transport-security"]);
  if (!parsed.present) {
    return createFinding({ code: FINDING_CODES.HSTS_MISSING, category: "headers", severity: "medium", status: "needs_attention", confidence: "high", type: "configuration", observationStatus: "not_observed", title: "HSTS not observed", evidenceSummary: "Strict-Transport-Security was not observed in the final HTTPS response.", whyItMatters: "HSTS tells supporting browsers to keep using HTTPS for this host after a secure visit." });
  }
  if (!Number.isInteger(parsed.maxAge) || parsed.maxAge < 31536000) {
    return createFinding({ code: FINDING_CODES.HSTS_WEAK, category: "headers", severity: "medium", status: "needs_attention", confidence: "high", type: "configuration", title: "HSTS policy is weaker than the one-year baseline", evidenceSummary: parsed.maxAge === null ? "HSTS was observed, but a valid max-age directive was not parsed." : `HSTS was observed with max-age=${parsed.maxAge}, below the one-year (31536000 second) baseline.`, whyItMatters: "A very short or invalid HSTS lifetime provides weaker downgrade resistance than a durable policy.", evidence: { maxAgeSeconds: parsed.maxAge, includeSubDomains: parsed.includeSubDomains } });
  }
  return createFinding({ code: FINDING_CODES.HSTS_PRESENT, category: "headers", severity: "info", status: "passed", confidence: "high", type: "configuration", title: "HSTS observed", evidenceSummary: `HSTS was observed with a max-age of ${parsed.maxAge} seconds${parsed.includeSubDomains ? " and includeSubDomains" : ""}.`, whyItMatters: "HSTS tells supporting browsers to keep using HTTPS for this host after a secure visit.", evidence: { maxAgeSeconds: parsed.maxAge, includeSubDomains: parsed.includeSubDomains } });
}

const REFERRER_POLICIES = new Set(["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin", "unsafe-url"]);
const WEAK_REFERRER_POLICIES = new Set(["unsafe-url", "no-referrer-when-downgrade"]);

function checkReferrerPolicy(headers) {
  const raw = String(headers["referrer-policy"] || "").trim().toLowerCase();
  if (!raw) return createFinding({ code: FINDING_CODES.REFERRER_POLICY_MISSING, category: "headers", severity: "low", status: "needs_attention", confidence: "high", type: "configuration", observationStatus: "not_observed", title: "Referrer-Policy not observed", evidenceSummary: "Referrer-Policy was not observed in the final representative HTTP response headers.", whyItMatters: "Referrer-Policy helps control how much navigation context is sent to other origins." });

  const tokens = raw.split(",").map((item) => item.trim()).filter(Boolean);
  const recognized = tokens.filter((item) => REFERRER_POLICIES.has(item));
  if (!recognized.length) {
    return createFinding({ code: FINDING_CODES.REFERRER_POLICY_INVALID, category: "headers", severity: "low", status: "manual_review", confidence: "high", type: "configuration", observationStatus: "inconclusive", title: "Referrer-Policy value was not recognized", evidenceSummary: "A Referrer-Policy header was present, but the scanner did not recognize a valid policy token.", whyItMatters: "An invalid policy can be ignored by browsers, so header presence alone is not enough." });
  }

  const effective = recognized.at(-1);
  if (WEAK_REFERRER_POLICIES.has(effective)) {
    return createFinding({ code: FINDING_CODES.REFERRER_POLICY_WEAK, category: "headers", severity: "low", status: "needs_attention", confidence: "high", type: "configuration", title: "Referrer-Policy is permissive", evidenceSummary: `The effective recognized Referrer-Policy is '${effective}', which can expose more URL context than stricter policies.`, whyItMatters: "Permissive referrer behavior can disclose path or query information to other origins.", evidence: { effectiveDirective: effective } });
  }
  return createFinding({ code: FINDING_CODES.REFERRER_POLICY_PRESENT, category: "headers", severity: "info", status: "passed", confidence: "high", type: "configuration", title: "Referrer-Policy observed", evidenceSummary: `The effective recognized Referrer-Policy is '${effective}'.`, whyItMatters: "Referrer-Policy helps control how much navigation context is sent to other origins.", evidence: { effectiveDirective: effective } });
}

export function parseFrameAncestors(csp) {
  const match = /(?:^|;)\s*frame-ancestors\s+([^;]+)/i.exec(String(csp || ""));
  if (!match) return { present: false, classification: "missing", sources: [] };
  const sources = match[1].trim().split(/\s+/).filter(Boolean).map((item) => item.toLowerCase());
  if (!sources.length) return { present: true, classification: "invalid", sources };
  if (sources.includes("'none'") && sources.length > 1) return { present: true, classification: "invalid", sources };
  if (sources.length === 1 && sources[0] === "'none'") return { present: true, classification: "restrictive", sources };
  if (sources.includes("*") || sources.some((source) => /^(https?|data|blob):$/.test(source))) return { present: true, classification: "permissive", sources };
  const valid = sources.every((source) => source === "'self'" || /^https?:\/\//.test(source) || /^\*\./.test(source));
  return { present: true, classification: valid ? "restricted_sources" : "invalid", sources };
}

function checkFrameProtection(headers, csp) {
  const frame = parseFrameAncestors(csp);
  const xfo = String(headers["x-frame-options"] || "").trim().toUpperCase();
  const validXfo = ["DENY", "SAMEORIGIN"].includes(xfo);

  if (frame.present && ["restrictive", "restricted_sources"].includes(frame.classification)) {
    return createFinding({ code: FINDING_CODES.FRAME_PROTECTION_PRESENT, category: "headers", severity: "info", status: "passed", confidence: "high", type: "configuration", title: "CSP frame restriction observed", evidenceSummary: frame.classification === "restrictive" ? "CSP frame-ancestors denies framing." : "CSP frame-ancestors limits framing to explicit sources.", whyItMatters: "Explicit frame restrictions reduce clickjacking exposure when configured correctly.", evidence: { mechanism: "csp-frame-ancestors", classification: frame.classification, sourceCount: frame.sources.length } });
  }
  if (frame.classification === "permissive") {
    return createFinding({ code: FINDING_CODES.FRAME_PROTECTION_PERMISSIVE, category: "headers", severity: "medium", status: "needs_attention", confidence: "high", type: "configuration", title: "CSP frame-ancestors is overly permissive", evidenceSummary: "A frame-ancestors directive was observed, but it allows a wildcard or broad scheme source.", whyItMatters: "A framing directive only reduces clickjacking exposure when it meaningfully restricts which parents may embed the page.", evidence: { mechanism: "csp-frame-ancestors", classification: frame.classification } });
  }
  if (frame.classification === "invalid") {
    return createFinding({ code: FINDING_CODES.FRAME_PROTECTION_INVALID, category: "headers", severity: "low", status: "manual_review", confidence: "high", type: "configuration", observationStatus: "inconclusive", title: "CSP frame-ancestors needs review", evidenceSummary: "A frame-ancestors directive was observed but its source list was malformed or outside the scanner's supported safe subset.", whyItMatters: "Malformed framing controls can be ignored or behave differently than intended." });
  }
  if (validXfo) {
    return createFinding({ code: FINDING_CODES.FRAME_PROTECTION_LEGACY_ONLY, category: "headers", severity: "low", status: "manual_review", confidence: "high", type: "configuration", title: "Only legacy X-Frame-Options protection observed", evidenceSummary: `X-Frame-Options: ${xfo} was observed, but CSP frame-ancestors was not observed.`, whyItMatters: "Modern guidance prefers CSP frame-ancestors as the primary framing control; X-Frame-Options remains useful mainly for compatibility.", evidence: { mechanism: "x-frame-options-only" } });
  }
  if (xfo && !validXfo) {
    return createFinding({ code: FINDING_CODES.FRAME_PROTECTION_INVALID, category: "headers", severity: "low", status: "manual_review", confidence: "high", type: "configuration", observationStatus: "inconclusive", title: "X-Frame-Options value needs review", evidenceSummary: "X-Frame-Options was present but was not DENY or SAMEORIGIN, and CSP frame-ancestors was absent.", whyItMatters: "Unsupported framing-control values may be ignored by browsers." });
  }
  return createFinding({ code: FINDING_CODES.FRAME_PROTECTION_MISSING, category: "headers", severity: "medium", status: "needs_attention", confidence: "high", type: "configuration", observationStatus: "not_observed", title: "Frame protection not observed", evidenceSummary: "Neither a restrictive CSP frame-ancestors directive nor a recognized X-Frame-Options value was observed in the representative response.", whyItMatters: "Frame restrictions can reduce clickjacking exposure when configured correctly.", evidence: { mechanism: "none" } });
}

function checkCoop(headers) {
  const value = String(headers["cross-origin-opener-policy"] || "").trim().toLowerCase();
  if (!value) return createFinding({ code: FINDING_CODES.COOP_MISSING, category: "headers", severity: "info", status: "manual_review", confidence: "high", type: "configuration", observationStatus: "not_observed", title: "Cross-Origin-Opener-Policy not observed", evidenceSummary: "COOP was not observed. Whether it is needed depends on application browsing-context requirements.", whyItMatters: "COOP can isolate top-level browsing contexts from cross-origin windows where the application design requires it." });
  if (value === "same-origin") return createFinding({ code: FINDING_CODES.COOP_PRESENT, category: "headers", severity: "info", status: "passed", confidence: "high", type: "configuration", title: "Cross-Origin-Opener-Policy isolation observed", evidenceSummary: "COOP same-origin was observed.", whyItMatters: "COOP can isolate top-level browsing contexts from cross-origin windows." });
  if (["same-origin-allow-popups", "noopener-allow-popups", "unsafe-none"].includes(value)) return createFinding({ code: FINDING_CODES.COOP_WEAK, category: "headers", severity: "info", status: "manual_review", confidence: "high", type: "configuration", title: "Cross-Origin-Opener-Policy needs contextual review", evidenceSummary: `COOP '${value}' was observed. The scanner records it but does not treat it as equivalent to strict same-origin isolation.`, whyItMatters: "The correct COOP value depends on popup, OAuth and cross-origin window requirements.", evidence: { value } });
  return createFinding({ code: FINDING_CODES.COOP_WEAK, category: "headers", severity: "info", status: "manual_review", confidence: "high", type: "configuration", observationStatus: "inconclusive", title: "Cross-Origin-Opener-Policy value was not recognized", evidenceSummary: "A COOP header was present but the scanner did not recognize the value.", whyItMatters: "Unrecognized policy values may not provide the intended browsing-context isolation." });
}

export function scanHeaders(headers, finalUrl, { representative = true } = {}) {
  const isHttps = new URL(finalUrl).protocol === "https:";
  const transportFindings = [checkHsts(headers, isHttps)].filter(Boolean);
  if (!representative) return transportFindings;

  const csp = String(headers["content-security-policy"] || "");
  const serverDisclosure = Boolean(headers["x-powered-by"]) || /\d/.test(String(headers.server || ""));
  return [
    presentOrMissing({ present: Boolean(csp), presentCode: FINDING_CODES.CSP_PRESENT, missingCode: FINDING_CODES.CSP_MISSING, title: "Content Security Policy", whyItMatters: "A well-designed CSP can reduce the impact of some content-injection attacks.", presentStatus: "observed", presentTitle: "Content Security Policy header observed", presentEvidence: "A Content-Security-Policy header was observed. Header presence is confirmed; policy strength is not fully evaluated by this passive rule pack." }),
    ...transportFindings,
    presentOrMissing({ present: String(headers["x-content-type-options"] || "").trim().toLowerCase() === "nosniff", presentCode: FINDING_CODES.X_CONTENT_TYPE_OPTIONS_PRESENT, missingCode: FINDING_CODES.X_CONTENT_TYPE_OPTIONS_MISSING, title: "X-Content-Type-Options nosniff", severity: "low", whyItMatters: "The nosniff directive reduces browser MIME-type guessing for some responses." }),
    checkReferrerPolicy(headers),
    checkFrameProtection(headers, csp),
    presentOrMissing({ present: Boolean(headers["permissions-policy"]), presentCode: FINDING_CODES.PERMISSIONS_POLICY_PRESENT, missingCode: FINDING_CODES.PERMISSIONS_POLICY_MISSING, title: "Permissions-Policy", severity: "info", whyItMatters: "Permissions-Policy can limit access to selected browser features when those features are relevant to the application.", missingStatus: "manual_review", presentStatus: "manual_review", presentTitle: "Permissions-Policy observed", presentEvidence: "A Permissions-Policy header was observed. The current rule pack records presence but does not fully evaluate feature directives." }),
    checkCoop(headers),
    createFinding({ code: serverDisclosure ? FINDING_CODES.SERVER_DISCLOSURE_PRESENT : FINDING_CODES.SERVER_DISCLOSURE_NOT_OBSERVED, category: "exposure", severity: serverDisclosure ? "low" : "info", status: serverDisclosure ? "manual_review" : "passed", confidence: "medium", type: "observation", title: serverDisclosure ? "Possible server/version disclosure" : "No obvious server/version disclosure", evidenceSummary: serverDisclosure ? "A public response header appears to reveal server technology or a version." : "No obvious version-bearing Server/X-Powered-By header was observed.", whyItMatters: "Technology disclosure is usually not a vulnerability by itself, but unnecessary version details can make targeted reconnaissance easier." })
  ].filter(Boolean);
}
