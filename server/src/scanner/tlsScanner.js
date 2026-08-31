import tls from "node:tls";
import net from "node:net";
import { env } from "../config/env.js";
import { FINDING_CODES } from "../../../shared/findingCodes.js";
import { createFinding } from "./normalizeFindings.js";
import { validateTargetUrl } from "./urlValidator.js";
import { HttpError } from "../utils/HttpError.js";

export async function scanTls(finalUrl) {
  const parsed = new URL(finalUrl);
  if (parsed.protocol !== "https:") return [];
  const validated = await validateTargetUrl(finalUrl);
  const selected = validated.addresses.find((item) => item.family === 4) || validated.addresses[0];

  return new Promise((resolve, reject) => {
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
      socket.end(); resolve(findings);
    });
    socket.setTimeout(env.scannerTimeoutMs, () => socket.destroy(new HttpError(504, "TLS metadata check timed out.", "TLS_TIMEOUT")));
    socket.on("error", (error) => reject(error));
  });
}
