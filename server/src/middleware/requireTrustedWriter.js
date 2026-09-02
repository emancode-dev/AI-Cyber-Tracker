import { getSystemSupabaseClient } from "../config/supabase.js";
import { HttpError } from "../utils/HttpError.js";

export function requireTrustedWriter(req, _res, next) {
  const client = getSystemSupabaseClient();
  if (!client) {
    return next(new HttpError(
      503,
      "Trusted assessment writes are not configured on the backend.",
      "TRUSTED_WRITER_NOT_CONFIGURED"
    ));
  }
  req.systemSupabase = client;
  next();
}
