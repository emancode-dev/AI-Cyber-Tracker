import { HttpError } from "../utils/HttpError.js";

export async function requireWebsiteOwnership(req, _res, next) {
  const { data, error } = await req.supabase.from("websites").select("id,user_id,name,url,domain,authorization_confirmed").eq("id", req.params.id).maybeSingle();
  if (error) return next(new HttpError(500, "Could not verify website ownership.", "OWNERSHIP_CHECK_FAILED"));
  if (!data) return next(new HttpError(404, "Website not found.", "WEBSITE_NOT_FOUND"));
  if (data.user_id !== req.user.id) return next(new HttpError(403, "You do not have permission to access this website.", "FORBIDDEN"));
  req.ownedWebsite = data; next();
}
