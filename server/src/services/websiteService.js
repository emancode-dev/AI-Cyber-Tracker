import {
  getLatestScanStatus,
  getLatestScoredScan,
  getWebsite,
  insertWebsite,
  listWebsites,
  patchWebsite,
  removeWebsite
} from "../repositories/websiteRepository.js";
import { HttpError } from "../utils/HttpError.js";

function normalizeTarget(rawUrl) {
  const parsed = new URL(rawUrl.trim());
  parsed.hash = "";
  return {
    url: parsed.toString(),
    domain: parsed.hostname.toLowerCase()
  };
}

export async function getAllWebsites(supabase) {
  const websites = await listWebsites(supabase);

  return Promise.all(
    websites.map(async (website) => {
      const [latest, latestAny] = await Promise.all([
        getLatestScoredScan(supabase, website.id),
        getLatestScanStatus(supabase, website.id)
      ]);
      const scorePending = Boolean(latestAny && latestAny.id !== latest?.id && latestAny.score === null);
      return {
        ...website,
        score: latest?.score ?? null,
        risk_level: latest?.risk_level ?? null,
        latest_scan_status: latestAny?.status ?? latest?.status ?? null,
        latest_scan_id: latest?.id ?? null,
        score_pending: scorePending
      };
    })
  );
}

export async function getOwnedWebsite(supabase, id) {
  const website = await getWebsite(supabase, id);
  if (!website) {
    throw new HttpError(404, "Website not found.", "WEBSITE_NOT_FOUND");
  }
  return website;
}

export async function createWebsite(supabase, userId, body) {
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
  const values = {};

  if (typeof body.name === "string" && body.name.trim()) {
    values.name = body.name.trim();
  }

  if (typeof body.url === "string" && body.url.trim()) {
    const normalized = normalizeTarget(body.url);
    values.url = normalized.url;
    values.domain = normalized.domain;
    values.authorization_confirmed = true;
    values.authorization_confirmed_at = new Date().toISOString();
  }

  if (!Object.keys(values).length) {
    return getOwnedWebsite(supabase, id);
  }
  return patchWebsite(supabase, id, values);
}

export async function deleteWebsite(supabase, id) {
  await removeWebsite(supabase, id);
}
