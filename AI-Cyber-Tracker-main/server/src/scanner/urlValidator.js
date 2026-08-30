import { lookup } from "node:dns/promises";
import net from "node:net";
import { env } from "../config/env.js";
import { HttpError } from "../utils/HttpError.js";
import { getUnsafeAddressReason } from "./ipSafety.js";

const BLOCKED_NAMES = new Set(["localhost", "localhost.localdomain"]);
const BLOCKED_SUFFIXES = [".localhost", ".local", ".internal"];

function scannerError(message, details = null) {
  return new HttpError(400, message, "SCANNER_URL_BLOCKED", details);
}

export async function validateTargetUrl(rawUrl) {
  if (typeof rawUrl !== "string" || rawUrl.trim().length === 0) throw scannerError("A target URL is required.");
  if (rawUrl.length > 2048) throw scannerError("The target URL is too long.");

  let url;
  try { url = new URL(rawUrl.trim()); } catch { throw scannerError("The target URL is not valid."); }
  if (!["http:", "https:"].includes(url.protocol)) throw scannerError("Only http:// and https:// targets are allowed.");
  if (url.username || url.password) throw scannerError("URLs containing embedded credentials are not allowed.");

  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!hostname || BLOCKED_NAMES.has(hostname) || BLOCKED_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    throw scannerError("Local or internal hostnames are not allowed.");
  }

  const effectivePort = Number.parseInt(url.port || (url.protocol === "https:" ? "443" : "80"), 10);
  if (!env.scannerAllowedPorts.has(effectivePort)) {
    throw scannerError(`Port ${effectivePort} is not allowed by the scanner policy.`, { allowedPorts: [...env.scannerAllowedPorts] });
  }

  let addresses;
  if (net.isIP(hostname)) {
    addresses = [{ address: hostname, family: net.isIP(hostname) }];
  } else {
    try { addresses = await lookup(hostname, { all: true, verbatim: true }); }
    catch { throw scannerError("The target hostname could not be resolved."); }
  }

  if (!addresses.length) throw scannerError("The target hostname did not resolve to an address.");
  for (const resolved of addresses) {
    const reason = getUnsafeAddressReason(resolved.address);
    if (reason) throw scannerError("The target resolves to a non-public address and cannot be scanned.", { addressFamily: resolved.family, reason });
  }

  url.hash = "";
  return { url, addresses, effectivePort };
}
