import http from "node:http";
import https from "node:https";
import net from "node:net";
import { env } from "../config/env.js";
import { HttpError } from "../utils/HttpError.js";
import { validateTargetUrl } from "./urlValidator.js";

const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);

function scannerNetworkError(message, details = null) {
  return new HttpError(502, message, "SCANNER_REQUEST_FAILED", details);
}

export async function safeRequest(rawUrl, { method = "GET", timeoutMs = env.scannerTimeoutMs, maxBytes = env.scannerMaxResponseBytes } = {}) {
  const validated = await validateTargetUrl(rawUrl);
  const { url, addresses, effectivePort } = validated;
  const selected = addresses.find((item) => item.family === 4) || addresses[0];
  const transport = url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const request = transport.request({
      protocol: url.protocol,
      hostname: url.hostname,
      port: effectivePort,
      method,
      path: `${url.pathname || "/"}${url.search}`,
      headers: {
        "User-Agent": "AI-Cyber-Tracker/0.2 (authorized passive assessment)",
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
        Connection: "close"
      },
      lookup: (_hostname, options, callback) => {
        if (options?.all) callback(null, [{ address: selected.address, family: selected.family }]);
        else callback(null, selected.address, selected.family);
      },
      ...(url.protocol === "https:" ? { rejectUnauthorized: false } : {}),
      ...(url.protocol === "https:" && !net.isIP(url.hostname) ? { servername: url.hostname } : {})
    }, (response) => {
      const chunks = [];
      let bytes = 0;
      let settled = false;

      response.on("data", (chunk) => {
        bytes += chunk.length;
        if (bytes > maxBytes) {
          settled = true;
          response.destroy();
          request.destroy();
          reject(scannerNetworkError("The response body exceeded the scanner size limit.", { maxBytes }));
          return;
        }
        chunks.push(chunk);
      });
      response.on("end", () => {
        if (settled) return;
        resolve({
          requestedUrl: url.toString(),
          statusCode: response.statusCode || 0,
          headers: response.headers,
          body: Buffer.concat(chunks).toString("utf8"),
          remoteAddressFamily: selected.family
        });
      });
    });

    request.setTimeout(timeoutMs, () => request.destroy(scannerNetworkError("The target request timed out.", { timeoutMs })));
    request.on("error", (error) => reject(error instanceof HttpError ? error : scannerNetworkError("The target request failed.", { cause: error.code || error.message })));
    request.end();
  });
}

export async function safeRequestWithRedirects(rawUrl, { maxRedirects = env.scannerMaxRedirects } = {}) {
  let currentUrl = rawUrl;
  const redirects = [];

  for (let index = 0; index <= maxRedirects; index += 1) {
    const response = await safeRequest(currentUrl);
    const location = response.headers.location;
    if (!REDIRECT_CODES.has(response.statusCode) || !location) {
      return { ...response, initialUrl: rawUrl, finalUrl: response.requestedUrl, redirects };
    }
    if (index === maxRedirects) throw scannerNetworkError("The target exceeded the maximum allowed redirect count.", { maxRedirects });
    const nextUrl = new URL(location, response.requestedUrl).toString();
    // The next request runs validateTargetUrl again, so every redirect destination is revalidated.
    redirects.push({ from: response.requestedUrl, to: nextUrl, statusCode: response.statusCode });
    currentUrl = nextUrl;
  }

  throw scannerNetworkError("Unexpected redirect handling failure.");
}
