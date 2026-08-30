import { createUserSupabaseClient } from "../config/supabase.js";
import { HttpError } from "../utils/HttpError.js";

export async function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return next(new HttpError(401, "Authentication is required.", "AUTH_REQUIRED"));

  try {
    const supabase = createUserSupabaseClient(token);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return next(new HttpError(401, "Your session is invalid or expired.", "INVALID_SESSION"));
    req.user = data.user; req.accessToken = token; req.supabase = supabase; next();
  } catch (error) { next(error); }
}
