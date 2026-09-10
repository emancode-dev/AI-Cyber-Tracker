import {
  getWebsite,
  insertWebsite,
  listDashboardWebsites,
  patchWebsite,
  removeWebsite
} from "../repositories/websiteRepository.js";
import { HttpError } from "../utils/HttpError.js";

export function normalizeTarget(rawUrl) {
  const parsed = new URL(rawUrl.trim());
  if (parsed.username || parsed.password) {
    throw new HttpError(400, "Target URLs must not contain embedded credentials.", "WEBSITE_URL_CREDENTIALS_FORBIDDEN");
  }
  parsed.hash = "";
  parsed.hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
  return {
    url: parsed.toString(),
    domain: parsed.hostname
  };
}

export async function getAllWebsites(supabase) {
  return listDashboardWebsites(supabase);
}

export async function getOwnedWebsite(supabase, id) {
  const website = await getWebsite(supabase, id);
  if (!website) throw new HttpError(404, "Website not found.", "WEBSITE_NOT_FOUND");
  return website;
}

export async function createWebsite(supabase, userId, body) {
  // Defense in depth: the route middleware already requires the explicit
  // authorization checkbox, but the service enforces the same invariant so a
  // future internal caller cannot silently create a scan-authorized target.
  if (body?.authorizationConfirmed !== true) {
    throw new HttpError(400, "Explicit ownership/authorization confirmation is required.", "SCAN_AUTHORIZATION_REQUIRED");
  }

  const normalized = normalizeTarget(body.url);
  return insertWebsite(supabase, {
    user_id: userId,
    name: body.name.trim(),
    url: normalized.url,
    domain: normalized.domain,
    authorization_confirmed: true,
    authorization_confirmed_at: new Date().toISOString()
  });
}

export async function updateWebsite(supabase, id, body) {
  const current = await getOwnedWebsite(supabase, id);
  const values = {};
  if (typeof body.name === "string" && body.name.trim()) values.name = body.name.trim();

  if (typeof body.url === "string" && body.url.trim()) {
    const normalized = normalizeTarget(body.url);
    if (normalized.url !== current.url) {
      throw new HttpError(409, "Assessment target URLs are immutable so retained scores cannot be attached to a different target. Add the new URL as a separate website.", "WEBSITE_TARGET_IMMUTABLE");
    }
  }

  if (!Object.keys(values).length) return current;
  return patchWebsite(supabase, id, values);
}

export async function deleteWebsite(supabase, id) {
  await removeWebsite(supabase, id);
}
