import tls from "node:tls";
import net from "node:net";
import { env } from "../config/env.js";
import { FINDING_CODES } from "../../../shared/findingCodes.js";
import { createFinding } from "./normalizeFindings.js";
import { validateTargetUrl } from "./urlValidator.js";

export async function scanTls(finalUrl) {
  const parsed = new URL(finalUrl);
  if (parsed.protocol !== "https:") return { findings: [], observations: [{ kind: "tls", key: "certificate", status: "not_tested", source: "tls_handshake", details: { reason: "target_not_https" } }] };

  try {
    const validated = await validateTargetUrl(finalUrl);
    const selected = validated.addresses.find((item) => item.family === 4) || validated.addresses[0];
    return await new Promise((resolve) => {
      let settled = false;
      const done = (value) => { if (settled) return; settled = true; clearTimeout(deadline); resolve(value); };
      const socket = tls.connect({ host: selected.address, port: validated.effectivePort, servername: net.isIP(parsed.hostname) ? undefined : parsed.hostname, rejectUnauthorized: false }, () => {
        const certificate = socket.getPeerCertificate();
        const validTo = certificate?.valid_to ? new Date(certificate.valid_to) : null;
        const now = new Date();
        const daysRemaining = validTo ? Math.ceil((validTo.getTime() - now.getTime()) / 86400000) : null;
        const findings = [];
        if (!socket.authorized) {
          findings.push(createFinding({ code: validTo && daysRemaining < 0 ? FINDING_CODES.TLS_CERT_EXPIRED : FINDING_CODES.TLS_CERT_INVALID, category: "tls", severity: "high", status: "needs_attention", confidence: "high", type: "configuration", title: "TLS certificate validation failed", evidenceSummary: `The TLS connection reported a certificate validation problem${socket.authorizationError ? ` (${socket.authorizationError})` : ""}.`, whyItMatters: "A certificate validation problem can prevent clients from authenticating the server securely." }));
        } else if (daysRemaining !== null && daysRemaining <= 30) {
          findings.push(createFinding({ code: FINDING_CODES.TLS_CERT_EXPIRING_SOON, category: "tls", severity: daysRemaining < 0 ? "high" : "medium", status: "needs_attention", confidence: "high", type: "configuration", title: daysRemaining < 0 ? "TLS certificate expired" : "TLS certificate expires soon", evidenceSummary: `The certificate expiry is ${validTo.toISOString()} (${daysRemaining} day(s) remaining).`, whyItMatters: "Expired certificates break trust; near-expiry certificates should be renewed before service interruption." }));
        } else {
          findings.push(createFinding({ code: FINDING_CODES.TLS_CERT_VALID, category: "tls", severity: "info", status: "passed", confidence: "high", type: "configuration", title: "TLS certificate currently validates", evidenceSummary: `TLS authorization succeeded${validTo ? `; certificate expiry is ${validTo.toISOString()}` : ""}. Protocol: ${socket.getProtocol() || "unknown"}.`, whyItMatters: "A currently valid certificate supports authenticated encrypted HTTPS. This is not a complete TLS configuration audit." }));
        }
        const protocol = socket.getProtocol() || "unknown";
        socket.end();
        done({ findings, observations: [{ kind: "tls", key: "certificate", status: socket.authorized ? "observed" : "inconclusive", source: "tls_handshake", details: { authorized: Boolean(socket.authorized), protocol, expiresAt: validTo ? validTo.toISOString() : null } }] });
      });
      const deadline = setTimeout(() => { socket.destroy(); done({ findings: [createFinding({ code: FINDING_CODES.TLS_CHECK_INCONCLUSIVE, category: "tls", severity: "info", status: "manual_review", confidence: "medium", type: "observation", observationStatus: "inconclusive", title: "TLS metadata check was inconclusive", evidenceSummary: "The auxiliary TLS metadata handshake exceeded its deadline.", whyItMatters: "The main HTTPS response may still be usable; this auxiliary timeout should not be misreported as an invalid certificate." })], observations: [{ kind: "tls", key: "certificate", status: "inconclusive", source: "tls_handshake", details: { reason: "deadline" } }] }); }, env.scannerRequestDeadlineMs);
      socket.setTimeout(env.scannerTimeoutMs, () => { socket.destroy(); done({ findings: [createFinding({ code: FINDING_CODES.TLS_CHECK_INCONCLUSIVE, category: "tls", severity: "info", status: "manual_review", confidence: "medium", type: "observation", observationStatus: "inconclusive", title: "TLS metadata check was inconclusive", evidenceSummary: "The auxiliary TLS metadata handshake timed out.", whyItMatters: "An auxiliary TLS timeout is uncertainty, not proof that the target certificate is invalid." })], observations: [{ kind: "tls", key: "certificate", status: "inconclusive", source: "tls_handshake", details: { reason: "timeout" } }] }); });
      socket.on("error", (error) => done({ findings: [createFinding({ code: FINDING_CODES.TLS_CHECK_INCONCLUSIVE, category: "tls", severity: "info", status: "manual_review", confidence: "medium", type: "observation", observationStatus: "inconclusive", title: "TLS metadata check was inconclusive", evidenceSummary: "The auxiliary TLS metadata handshake could not be completed.", whyItMatters: "An auxiliary connection failure is uncertainty, not proof of an invalid certificate." })], observations: [{ kind: "tls", key: "certificate", status: "inconclusive", source: "tls_handshake", details: { reason: error.code || "connection_error" } }] }));
    });
  } catch (error) {
    return { findings: [createFinding({ code: FINDING_CODES.TLS_CHECK_INCONCLUSIVE, category: "tls", severity: "info", status: "manual_review", confidence: "medium", type: "observation", observationStatus: "inconclusive", title: "TLS metadata check was inconclusive", evidenceSummary: "The auxiliary TLS metadata check could not validate its target safely.", whyItMatters: "This check is separate from the main response and should not turn uncertainty into a certificate failure." })], observations: [{ kind: "tls", key: "certificate", status: "inconclusive", source: "tls_handshake", details: { reason: error?.code || "validation_error" } }] };
  }
}
