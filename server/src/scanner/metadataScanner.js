import { FINDING_CODES } from "../../../shared/findingCodes.js";
import { createFinding } from "./normalizeFindings.js";
import { safeRequestWithRedirects } from "./safeRequest.js";

function scanHtml(body) {
  const findings = [];
  if (/<form\b/i.test(body)) findings.push(createFinding({ code: FINDING_CODES.FORM_DETECTED, category: "forms", severity: "info", status: "observed", confidence: "high", type: "observation", title: "Form detected", evidenceSummary: "At least one HTML form element was observed. No form submission was attempted.", whyItMatters: "Forms can indicate user-input flows that may need additional owner context, but their presence is not a vulnerability." }));
  if (/<input\b[^>]*type\s*=\s*["']?password/i.test(body)) findings.push(createFinding({ code: FINDING_CODES.PASSWORD_FIELD_DETECTED, category: "forms", severity: "info", status: "manual_review", confidence: "medium", type: "observation", title: "Password field detected", evidenceSummary: "A password input was observed in public HTML. No credential testing was performed.", whyItMatters: "Authentication context can make controls such as secure cookies and MFA more important, but a password field alone is not a finding of compromise." }));
  if (/(stack trace|traceback \(most recent call last\)|sqlstate\[|uncaught exception|debug\s*[:=]\s*true)/i.test(body)) findings.push(createFinding({ code: FINDING_CODES.POTENTIAL_DEBUG_EXPOSURE, category: "exposure", severity: "medium", status: "manual_review", confidence: "low", type: "manual_review", title: "Possible debug/error exposure", evidenceSummary: "Public HTML matched a small set of debug/error text patterns.", whyItMatters: "Detailed production errors can reveal implementation information, but text-pattern matching can produce false positives, so this requires manual review." }));
  return findings;
}

function looksLikeRobots(response) {
  const type = String(response.headers["content-type"] || "").toLowerCase();
  const body = String(response.body || "").slice(0, 200000);
  return (!type || type.includes("text/plain") || type.includes("text/")) && /^\s*(user-agent|sitemap)\s*:/im.test(body);
}

function looksLikeSitemap(response) {
  const type = String(response.headers["content-type"] || "").toLowerCase();
  const body = String(response.body || "").slice(0, 200000);
  return (type.includes("xml") || /^\s*<\?xml/i.test(body)) && /<(urlset|sitemapindex)\b/i.test(body);
}

function looksLikeSecurityTxt(response) {
  const type = String(response.headers["content-type"] || "").toLowerCase();
  const body = String(response.body || "").slice(0, 200000);
  return (!type || type.includes("text/plain") || type.includes("text/")) && /^\s*contact\s*:/im.test(body) && /^\s*expires\s*:/im.test(body);
}

const VALIDATORS = {
  "/robots.txt": looksLikeRobots,
  "/sitemap.xml": looksLikeSitemap,
  "/.well-known/security.txt": looksLikeSecurityTxt
};

export function validateMetadataContent(path, response) {
  return Boolean(VALIDATORS[path]?.(response));
}

export async function checkMetadataEndpoint(finalUrl, path, code, title) {
  const target = new URL(path, finalUrl).toString();
  try {
    const response = await safeRequestWithRedirects(target, { maxRedirects: 1 });
    const success = response.statusCode >= 200 && response.statusCode < 300;
    const validContent = success && validateMetadataContent(path, response);
    const status = validContent ? "observed" : success ? "inconclusive" : "not_observed";
    return {
      finding: validContent ? createFinding({ code, category: "metadata", severity: "info", status: "observed", confidence: "high", type: "observation", title, evidenceSummary: `${path} returned HTTP ${response.statusCode} with content matching the expected public metadata format.`, whyItMatters: "This is safe public metadata observation, not a vulnerability by itself.", evidence: { path, statusCode: response.statusCode } }) : null,
      observation: { kind: "metadata", key: path, status, source: "public_endpoint", details: { statusCode: response.statusCode, contentValidated: validContent } }
    };
  } catch (error) {
    return { finding: null, observation: { kind: "metadata", key: path, status: "inconclusive", source: "public_endpoint", details: { reason: error?.code || "request_failed" } } };
  }
}

export async function scanMetadata(finalUrl, body, { representative = true } = {}) {
  const endpointResults = await Promise.all([
    checkMetadataEndpoint(finalUrl, "/robots.txt", FINDING_CODES.ROBOTS_TXT_PRESENT, "robots.txt observed"),
    checkMetadataEndpoint(finalUrl, "/sitemap.xml", FINDING_CODES.SITEMAP_PRESENT, "sitemap.xml observed"),
    checkMetadataEndpoint(finalUrl, "/.well-known/security.txt", FINDING_CODES.SECURITY_TXT_PRESENT, "security.txt observed")
  ]);
  return {
    findings: [...(representative ? scanHtml(body) : []), ...endpointResults.map((item) => item.finding).filter(Boolean)],
    observations: endpointResults.map((item) => item.observation)
  };
}
