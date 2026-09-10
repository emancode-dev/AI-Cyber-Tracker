import { FINDING_CODES } from "../../../shared/findingCodes.js";
import { createFinding } from "./normalizeFindings.js";
import { safeRequestWithRedirects } from "./safeRequest.js";
import { scanRedirects } from "./redirectScanner.js";
import { classifyPrimaryResponse } from "./responseClassifier.js";

export async function scanHttp(rawUrl) {
  const response = await safeRequestWithRedirects(rawUrl);
  const finalProtocol = new URL(response.finalUrl).protocol;
  const classification = classifyPrimaryResponse(response);
  const findings = [];

  if (finalProtocol === "https:") {
    findings.push(createFinding({ code: FINDING_CODES.HTTPS_PRESENT, category: "transport", severity: "info", status: "passed", confidence: "high", type: "configuration", title: "HTTPS is in use", evidenceSummary: "The final validated target URL uses HTTPS.", whyItMatters: "HTTPS protects traffic in transit. It is a baseline control, not a guarantee of total application security." }));
  } else {
    findings.push(createFinding({ code: FINDING_CODES.HTTPS_MISSING, category: "transport", severity: "high", status: "needs_attention", confidence: "high", type: "configuration", title: "HTTPS is not in use", evidenceSummary: "The final validated target URL uses HTTP.", whyItMatters: "Plain HTTP does not provide transport encryption or server authentication." }));
  }

  if (response.statusCode >= 400) {
    findings.push(createFinding({ code: FINDING_CODES.HTTP_STATUS_ERROR, category: "transport", severity: "low", status: "manual_review", confidence: "high", type: "observation", title: "Target returned an error status", evidenceSummary: `The final response status was ${response.statusCode}.`, whyItMatters: "An error response can limit what a passive scanner can observe and may need manual review." }));
  }

  if (!classification.representative) {
    findings.push(createFinding({ code: FINDING_CODES.RESPONSE_NOT_REPRESENTATIVE, category: "scope", severity: "info", status: "manual_review", confidence: "high", type: "observation", observationStatus: "inconclusive", title: "Document-level checks were limited", evidenceSummary: `The final response was classified as '${classification.reason}', so HTML document controls were not scored as if this were the normal application page.`, whyItMatters: "Error, challenge, redirect, or non-HTML responses can misrepresent the controls on the actual application document.", evidence: { statusCode: response.statusCode, reason: classification.reason } }));
  }

  findings.push(...scanRedirects(rawUrl, response.finalUrl, response.redirects));
  return { response, findings, classification };
}
