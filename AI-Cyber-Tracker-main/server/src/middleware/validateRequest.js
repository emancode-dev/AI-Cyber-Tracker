import { HttpError } from "../utils/HttpError.js";
function isHttpUrl(value) { try { const parsed = new URL(value); return ["http:", "https:"].includes(parsed.protocol); } catch { return false; } }
export function validateWebsiteBody(req, _res, next) {
  const { name, url, authorizationConfirmed } = req.body || {}; const details = {};
  if (typeof name !== "string" || !name.trim()) details.name = "Website name is required.";
  if (typeof url !== "string" || !isHttpUrl(url.trim())) details.url = "Enter a complete http:// or https:// URL.";
  if (authorizationConfirmed !== true) details.authorizationConfirmed = "Explicit ownership/authorization confirmation is required.";
  if (Object.keys(details).length) return next(new HttpError(400, "Website data is invalid.", "VALIDATION_ERROR", details));
  next();
}

export function validateWebsitePatch(req, _res, next) {
  const { name, url, authorizationConfirmed } = req.body || {};
  const details = {};
  if (name !== undefined && (typeof name !== "string" || !name.trim())) details.name = "Website name cannot be empty.";
  if (url !== undefined) {
    if (typeof url !== "string" || !isHttpUrl(url.trim())) details.url = "Enter a complete http:// or https:// URL.";
    if (authorizationConfirmed !== true) details.authorizationConfirmed = "Changing the target URL requires a fresh ownership/authorization confirmation.";
  }
  if (Object.keys(details).length) return next(new HttpError(400, "Website update is invalid.", "VALIDATION_ERROR", details));
  next();
}
