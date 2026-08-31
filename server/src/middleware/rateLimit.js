import { env } from "../config/env.js";
import { HttpError } from "../utils/HttpError.js";

const buckets = new Map();

function getKey(req) {
  return req.user?.id || req.ip || "anonymous";
}

export function scanRateLimit(req, res, next) {
  const now = Date.now();
  const key = getKey(req);
  const current = buckets.get(key);

  if (!current || now >= current.resetAt) {
    buckets.set(key, {
      count: 1,
      resetAt: now + env.scanRateLimitWindowMs
    });
    return next();
  }

  if (current.count >= env.scanRateLimitMax) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((current.resetAt - now) / 1000)
    );
    res.setHeader("Retry-After", String(retryAfterSeconds));
    return next(
      new HttpError(
        429,
        "Too many scan requests. Please wait before starting another scan.",
        "SCAN_RATE_LIMITED",
        { retryAfterSeconds }
      )
    );
  }

  current.count += 1;
  buckets.set(key, current);
  next();
}

export function clearRateLimitStateForTests() {
  buckets.clear();
}
