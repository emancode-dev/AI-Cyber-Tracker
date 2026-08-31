import { HttpError } from "../utils/HttpError.js";
export async function getOrCreateProfile(supabase, user) {
  const { data: existing, error: readError } = await supabase.from("profiles").select("id,name,avatar_url,role,created_at,updated_at").eq("id", user.id).maybeSingle();
  if (readError) throw new HttpError(500, "Could not read profile.", "PROFILE_QUERY_FAILED");
  if (existing) return existing;
  const name = user.user_metadata?.name || user.email?.split("@")[0] || "User";
  const { data, error } = await supabase.from("profiles").insert({ id: user.id, name }).select("id,name,avatar_url,role,created_at,updated_at").single();
  if (error) throw new HttpError(500, "Could not create profile.", "PROFILE_CREATE_FAILED");
  return data;
}

export async function updateProfile(supabase, userId, changes) {
  const { data, error } = await supabase
    .from("profiles")
    .update(changes)
    .eq("id", userId)
    .select("id,name,avatar_url,role,created_at,updated_at")
    .single();
  if (error) throw new HttpError(500, "Could not update profile.", "PROFILE_UPDATE_FAILED");
  return data;
}
