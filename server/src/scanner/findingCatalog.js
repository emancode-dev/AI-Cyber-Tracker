import { FINDING_CODES } from "../../../shared/findingCodes.js";
import { VERSIONS } from "../config/versions.js";

const A02 = "OWASP Top 10 A02:2025 Security Misconfiguration";
const WSTG_CONFIG = "OWASP WSTG - Configuration and Deployment Management Testing";

const CATALOG = Object.freeze({
  [FINDING_CODES.HTTPS_MISSING]: {
    remediation: "Serve the site only over HTTPS and redirect HTTP requests to HTTPS before users enter sensitive data.",
    verification: "Rescan and confirm the final validated target is HTTPS and no HTTPS-to-HTTP downgrade occurs.",
    standards: { owaspTop10: ["A04:2025 Cryptographic Failures"], asvs: ["v5.0.0-3.1.1"], wstg: [WSTG_CONFIG] }
  },
  [FINDING_CODES.HTTPS_PRESENT]: {
    remediation: "Keep HTTPS enforced across the application and renew certificates before expiry.",
    verification: "Rescan after infrastructure or certificate changes and confirm the final target remains HTTPS.",
    standards: { owaspTop10: ["A04:2025 Cryptographic Failures"], asvs: ["v5.0.0-3.1.1"], wstg: [WSTG_CONFIG] }
  },
  [FINDING_CODES.HSTS_MISSING]: {
    remediation: "After confirming the site and required subdomains are HTTPS-ready, add Strict-Transport-Security with an appropriate long max-age.",
    verification: "Rescan the HTTPS endpoint and confirm Strict-Transport-Security is present with an appropriate policy.",
    standards: { owaspTop10: [A02], asvs: ["v5.0.0-3.4.1"], wstg: [WSTG_CONFIG] }
  },
  [FINDING_CODES.HSTS_WEAK]: {
    remediation: "Increase the HSTS max-age to at least one year when operationally safe; evaluate includeSubDomains for the application scope.",
    verification: "Rescan and confirm HSTS has a valid max-age of at least 31536000 seconds.",
    standards: { owaspTop10: [A02], asvs: ["v5.0.0-3.4.1"], wstg: [WSTG_CONFIG] }
  },
  [FINDING_CODES.HSTS_PRESENT]: {
    remediation: "Keep the HSTS policy reviewed as domains and subdomains change.",
    verification: "Rescan periodically and after proxy/CDN changes to confirm the policy remains present.",
    standards: { owaspTop10: [A02], asvs: ["v5.0.0-3.4.1"], wstg: [WSTG_CONFIG] }
  },
  [FINDING_CODES.CSP_MISSING]: {
    remediation: "Design and deploy a Content-Security-Policy that restricts resource loading to trusted sources; test it in staging before enforcement.",
    verification: "Rescan and confirm the final HTML response includes a Content-Security-Policy header; separately review policy quality.",
    standards: { owaspTop10: [A02], asvs: ["v5.0.0-3.4.3"], wstg: [WSTG_CONFIG] }
  },
  [FINDING_CODES.CSP_PRESENT]: {
    remediation: "Review CSP quality, including trusted sources, object-src/base-uri restrictions, and nonce/hash strategy where appropriate.",
    verification: "Verify the policy is enforced on relevant HTML responses and test that required application functionality still works.",
    standards: { owaspTop10: [A02], asvs: ["v5.0.0-3.4.3"], wstg: [WSTG_CONFIG] }
  },
  [FINDING_CODES.X_CONTENT_TYPE_OPTIONS_MISSING]: {
    remediation: "Add X-Content-Type-Options: nosniff to relevant HTTP responses.",
    verification: "Rescan and confirm the final response includes X-Content-Type-Options: nosniff.",
    standards: { owaspTop10: [A02], asvs: ["v5.0.0-3.4.4"], wstg: [WSTG_CONFIG] }
  },
  [FINDING_CODES.X_CONTENT_TYPE_OPTIONS_PRESENT]: {
    remediation: "Keep nosniff enabled and ensure accurate Content-Type values are sent.",
    verification: "Rescan after web-server or CDN configuration changes.",
    standards: { owaspTop10: [A02], asvs: ["v5.0.0-3.4.4"], wstg: [WSTG_CONFIG] }
  },
  [FINDING_CODES.REFERRER_POLICY_MISSING]: {
    remediation: "Set an explicit Referrer-Policy appropriate to the application, commonly strict-origin-when-cross-origin or a stricter policy.",
    verification: "Rescan and confirm an explicit non-unsafe Referrer-Policy is observed.",
    standards: { owaspTop10: [A02], asvs: ["v5.0.0-3.4.5"], wstg: [WSTG_CONFIG] }
  },
  [FINDING_CODES.REFERRER_POLICY_WEAK]: {
    remediation: "Replace the observed permissive Referrer-Policy with a policy that limits cross-origin URL leakage.",
    verification: "Rescan and confirm the permissive policy value is no longer returned.",
    standards: { owaspTop10: [A02], asvs: ["v5.0.0-3.4.5"], wstg: [WSTG_CONFIG] }
  },
  [FINDING_CODES.REFERRER_POLICY_PRESENT]: {
    remediation: "Keep the referrer policy aligned with the sensitivity of URL paths and query strings.",
    verification: "Rescan after routing, proxy, or HTML-template changes.",
    standards: { owaspTop10: [A02], asvs: ["v5.0.0-3.4.5"], wstg: [WSTG_CONFIG] }
  },
  [FINDING_CODES.FRAME_PROTECTION_MISSING]: {
    remediation: "Use the CSP frame-ancestors directive to deny framing by default and allow only explicitly required origins.",
    verification: "Rescan and confirm CSP contains frame-ancestors on the relevant HTML response.",
    standards: { owaspTop10: [A02], asvs: ["v5.0.0-3.4.6"], wstg: [WSTG_CONFIG] }
  },
  [FINDING_CODES.FRAME_PROTECTION_LEGACY_ONLY]: {
    remediation: "Keep legacy X-Frame-Options only for compatibility if needed, but add CSP frame-ancestors as the primary framing control.",
    verification: "Rescan and confirm CSP frame-ancestors is present rather than relying only on X-Frame-Options.",
    standards: { owaspTop10: [A02], asvs: ["v5.0.0-3.4.6"], wstg: [WSTG_CONFIG] }
  },
  [FINDING_CODES.FRAME_PROTECTION_PRESENT]: {
    remediation: "Keep frame-ancestors aligned with the origins that genuinely need embedding access.",
    verification: "Rescan after CSP changes and confirm frame-ancestors remains explicit.",
    standards: { owaspTop10: [A02], asvs: ["v5.0.0-3.4.6"], wstg: [WSTG_CONFIG] }
  },
  [FINDING_CODES.COOP_MISSING]: {
    remediation: "For document responses that need stronger browsing-context isolation, evaluate Cross-Origin-Opener-Policy and choose the least permissive value compatible with the app.",
    verification: "Rescan the document response and confirm Cross-Origin-Opener-Policy is present when required by the application design.",
    standards: { owaspTop10: [A02], asvs: ["v5.0.0-3.4.8"], wstg: [WSTG_CONFIG] }
  },
  [FINDING_CODES.COOP_PRESENT]: {
    remediation: "Keep the COOP value aligned with popup and cross-origin window requirements.",
    verification: "Rescan after frontend or authentication-window changes.",
    standards: { owaspTop10: [A02], asvs: ["v5.0.0-3.4.8"], wstg: [WSTG_CONFIG] }
  },
  [FINDING_CODES.COOKIE_SECURE_MISSING]: {
    remediation: "Mark sensitive cookies Secure and ensure they are only issued over HTTPS.",
    verification: "Rescan a response that sets the cookie and confirm every relevant Set-Cookie header includes Secure.",
    standards: { owaspTop10: [A02], asvs: ["v5.0.0-3.3.1"], wstg: ["OWASP WSTG - Session Management Testing"] }
  },
  [FINDING_CODES.COOKIE_HTTPONLY_MISSING]: {
    remediation: "Apply HttpOnly to cookies whose values do not need to be read by client-side JavaScript, especially session tokens.",
    verification: "Rescan a response that sets the cookie and confirm relevant Set-Cookie headers include HttpOnly.",
    standards: { owaspTop10: [A02], asvs: ["v5.0.0-3.3.4"], wstg: ["OWASP WSTG - Session Management Testing"] }
  },
  [FINDING_CODES.COOKIE_SAMESITE_MISSING]: {
    remediation: "Set SameSite according to each cookie's cross-site use case and verify CSRF-sensitive flows explicitly.",
    verification: "Rescan a response that sets cookies and confirm relevant cookies carry an intentional SameSite value.",
    standards: { owaspTop10: [A02], asvs: ["v5.0.0-3.3.2"], wstg: ["OWASP WSTG - Session Management Testing"] }
  },
  [FINDING_CODES.TLS_CERT_INVALID]: {
    remediation: "Replace or reconfigure the certificate chain so standard clients can validate the certificate for the requested hostname.",
    verification: "Rescan and confirm TLS authorization succeeds for the requested hostname.",
    standards: { owaspTop10: ["A04:2025 Cryptographic Failures"], asvs: [], wstg: ["OWASP WSTG - Transport Layer Security Testing"] }
  },
  [FINDING_CODES.TLS_CERT_EXPIRED]: {
    remediation: "Renew the expired certificate and verify automated renewal/monitoring is working.",
    verification: "Rescan and confirm the certificate validates and has a future expiry date.",
    standards: { owaspTop10: ["A04:2025 Cryptographic Failures"], asvs: [], wstg: ["OWASP WSTG - Transport Layer Security Testing"] }
  },
  [FINDING_CODES.TLS_CERT_EXPIRING_SOON]: {
    remediation: "Renew the certificate before expiry and check the automated renewal path.",
    verification: "Rescan after renewal and confirm the expiry window is no longer near-term.",
    standards: { owaspTop10: ["A04:2025 Cryptographic Failures"], asvs: [], wstg: ["OWASP WSTG - Transport Layer Security Testing"] }
  }
});

const EMPTY_STANDARDS = Object.freeze({ owaspTop10: [], asvs: [], wstg: [] });

export function catalogFor(code) {
  return CATALOG[code] || {
    remediation: "Review the observation against the application design and make the smallest safe configuration change if action is required.",
    verification: "Repeat the same assessment after the change and confirm the observation behaves as intended.",
    standards: EMPTY_STANDARDS
  };
}

export function enrichFindingMetadata(finding) {
  const catalog = catalogFor(finding.code);
  return {
    ...finding,
    remediation: finding.remediation || catalog.remediation,
    verification: finding.verification || catalog.verification,
    standards: finding.standards || catalog.standards,
    ruleVersion: finding.ruleVersion || VERSIONS.rulePack,
    source: finding.source || "passive_http",
    evidence: finding.evidence || { summary: finding.evidenceSummary }
  };
}
