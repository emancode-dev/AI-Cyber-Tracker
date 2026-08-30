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

async function checkMetadataEndpoint(finalUrl, path, code, title) {
  const target = new URL(path, finalUrl).toString();
  try {
    const response = await safeRequestWithRedirects(target, { maxRedirects: 1 });
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return createFinding({ code, category: "metadata", severity: "info", status: "observed", confidence: "high", type: "observation", title, evidenceSummary: `${path} returned HTTP ${response.statusCode}.`, whyItMatters: "This is safe public metadata observation, not a vulnerability by itself." });
    }
  } catch {
    // Missing/unreachable optional metadata is not treated as a vulnerability.
  }
  return null;
}

export async function scanMetadata(finalUrl, body) {
  const endpointFindings = await Promise.all([
    checkMetadataEndpoint(finalUrl, "/robots.txt", FINDING_CODES.ROBOTS_TXT_PRESENT, "robots.txt observed"),
    checkMetadataEndpoint(finalUrl, "/sitemap.xml", FINDING_CODES.SITEMAP_PRESENT, "sitemap.xml observed"),
    checkMetadataEndpoint(finalUrl, "/.well-known/security.txt", FINDING_CODES.SECURITY_TXT_PRESENT, "security.txt observed")
  ]);
  return [...scanHtml(body), ...endpointFindings.filter(Boolean)];
}
