import http from "node:http";
import https from "node:https";
import net from "node:net";
import { env } from "../config/env.js";
import { HttpError } from "../utils/HttpError.js";
import { validateTargetUrl } from "./urlValidator.js";

const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);

function canonicalAuthorizedHostname(hostname) {
  return String(hostname || "").toLowerCase().replace(/\.$/, "").replace(/^www\./, "");
}

export function isRedirectHostInScope(initialUrl, nextUrl) {
  const initial = new URL(initialUrl);
  const next = new URL(nextUrl);
  return canonicalAuthorizedHostname(initial.hostname) === canonicalAuthorizedHostname(next.hostname);
}
function scannerNetworkError(message, details = null) { return new HttpError(502, message, "SCANNER_REQUEST_FAILED", details); }

export async function safeRequest(rawUrl, { method = "GET", timeoutMs = env.scannerTimeoutMs, deadlineMs = env.scannerRequestDeadlineMs, maxBytes = env.scannerMaxResponseBytes } = {}) {
  const validated = await validateTargetUrl(rawUrl);
  const { url, addresses, effectivePort } = validated;
  const selected = addresses.find((item) => item.family === 4) || addresses[0];
  const transport = url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    let settled = false;
    let deadlineTimer;
    const finishReject = (error) => { if (settled) return; settled = true; clearTimeout(deadlineTimer); reject(error); };
    const request = transport.request({
      protocol: url.protocol, hostname: url.hostname, port: effectivePort, method,
      path: `${url.pathname || "/"}${url.search}`,
      headers: { "User-Agent": "AI-Cyber-Tracker/0.5 (authorized passive assessment)", Accept: "text/html,application/xhtml+xml,text/plain,application/xml;q=0.8,*/*;q=0.3", Connection: "close" },
      lookup: (_hostname, options, callback) => options?.all ? callback(null, [{ address: selected.address, family: selected.family }]) : callback(null, selected.address, selected.family),
      ...(url.protocol === "https:" ? { rejectUnauthorized: false } : {}),
      ...(url.protocol === "https:" && !net.isIP(url.hostname) ? { servername: url.hostname } : {})
    }, (response) => {
      const chunks = [];
      let bytes = 0;
      response.on("data", (chunk) => {
        bytes += chunk.length;
        if (bytes > maxBytes) {
          response.destroy(); request.destroy();
          finishReject(scannerNetworkError("The response body exceeded the scanner size limit.", { maxBytes }));
          return;
        }
        chunks.push(chunk);
      });
      response.on("aborted", () => finishReject(scannerNetworkError("The target response ended unexpectedly.")));
      response.on("end", () => {
        if (settled) return;
        settled = true; clearTimeout(deadlineTimer);
        resolve({ requestedUrl: url.toString(), statusCode: response.statusCode || 0, headers: response.headers, body: Buffer.concat(chunks).toString("utf8"), remoteAddressFamily: selected.family });
      });
    });

    deadlineTimer = setTimeout(() => request.destroy(new HttpError(504, "The target request exceeded the absolute scanner deadline.", "SCANNER_REQUEST_DEADLINE", { deadlineMs })), deadlineMs);
    request.setTimeout(timeoutMs, () => request.destroy(new HttpError(504, "The target request was inactive for too long.", "SCANNER_REQUEST_TIMEOUT", { timeoutMs })));
    request.on("error", (error) => finishReject(error instanceof HttpError ? error : scannerNetworkError("The target request failed.", { cause: error.code || error.message })));
    request.end();
  });
}

export async function safeRequestWithRedirects(rawUrl, { maxRedirects = env.scannerMaxRedirects } = {}) {
  let currentUrl = rawUrl;
  const redirects = [];
  for (let index = 0; index <= maxRedirects; index += 1) {
    const response = await safeRequest(currentUrl);
    const location = response.headers.location;
    if (!REDIRECT_CODES.has(response.statusCode) || !location) return { ...response, initialUrl: rawUrl, finalUrl: response.requestedUrl, redirects };
    if (index === maxRedirects) throw scannerNetworkError("The target exceeded the maximum allowed redirect count.", { maxRedirects });
    const nextUrl = new URL(location, response.requestedUrl).toString();

    // Authorization is attached to the saved target, not to arbitrary hosts a
    // response may redirect toward. Permit only the same hostname plus the
    // common apex/www canonical pair; a different host must be added and
    // explicitly authorized as its own assessment target.
    if (!isRedirectHostInScope(rawUrl, nextUrl)) {
      throw new HttpError(409, "The target redirected outside the authorized hostname scope. Add the redirected host as a separate authorized website if you need to assess it.", "SCANNER_REDIRECT_SCOPE_EXIT", {
        fromHost: new URL(response.requestedUrl).hostname,
        toHost: new URL(nextUrl).hostname
      });
    }

    redirects.push({ from: response.requestedUrl, to: nextUrl, statusCode: response.statusCode });
    currentUrl = nextUrl;
  }
  throw scannerNetworkError("Unexpected redirect handling failure.");
}
