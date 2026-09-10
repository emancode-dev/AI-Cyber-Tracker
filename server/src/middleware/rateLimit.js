import { env } from "../config/env.js";
import { consumeScanQuota } from "../repositories/scanRepository.js";
import { HttpError } from "../utils/HttpError.js";

export async function scanRateLimit(req, res, next) {
  if (!req.user?.id || !req.systemSupabase) {
    return next(new HttpError(503, "Shared scan quota is not available.", "SCAN_RATE_LIMIT_UNAVAILABLE"));
  }

  const quota = await consumeScanQuota(
    req.systemSupabase,
    req.user.id,
    env.scanRateLimitMax,
    env.scanRateLimitWindowMs
  );

  if (!quota.allowed) {
    const retryAfterSeconds = Math.max(1, Number(quota.retryAfterSeconds) || 1);
    res.setHeader("Retry-After", String(retryAfterSeconds));
    return next(new HttpError(
      429,
      "Too many scan requests. Please wait before starting another scan.",
      "SCAN_RATE_LIMITED",
      { retryAfterSeconds }
    ));
  }

  next();
}
