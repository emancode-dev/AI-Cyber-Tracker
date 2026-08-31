import { FINDING_CODES } from "../../../shared/findingCodes.js";
import { createFinding } from "./normalizeFindings.js";

export function scanRedirects(initialUrl, finalUrl, redirects) {
  const findings = [];
  const initial = new URL(initialUrl);
  const final = new URL(finalUrl);

  if (initial.protocol === "https:" && final.protocol === "http:") {
    findings.push(createFinding({ code: FINDING_CODES.HTTPS_DOWNGRADE_REDIRECT, category: "transport", severity: "high", status: "needs_attention", confidence: "high", type: "configuration", title: "HTTPS redirects to HTTP", evidenceSummary: "The redirect chain ends on plain HTTP.", whyItMatters: "Downgrading from HTTPS to HTTP can remove transport protection for later traffic." }));
  } else if (redirects.length > 0) {
    findings.push(createFinding({ code: FINDING_CODES.REDIRECT_CHAIN_SAFE, category: "transport", severity: "info", status: "passed", confidence: "high", type: "observation", title: "Redirect chain stayed on validated public targets", evidenceSummary: `${redirects.length} redirect${redirects.length === 1 ? "" : "s"} were followed and every destination was revalidated.`, whyItMatters: "Revalidating each redirect is important because a safe-looking starting URL can otherwise redirect a server-side scanner toward an internal destination." }));
  }

  return findings;
}
