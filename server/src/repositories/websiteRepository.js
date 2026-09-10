import { HttpError } from "../utils/HttpError.js";

function mapDatabaseError(error, fallback) {
  if (!error) return null;
  if (error.code === "23505") {
    return new HttpError(409, "This website is already saved in your account.", "WEBSITE_DUPLICATE");
  }
  return new HttpError(500, fallback, "DATABASE_ERROR", { databaseCode: error.code || null });
}

export async function listWebsites(supabase) {
  const { data, error } = await supabase
    .from("websites")
    .select("id,user_id,name,url,domain,authorization_confirmed,authorization_confirmed_at,created_at")
    .order("created_at", { ascending: false });

  if (error) throw mapDatabaseError(error, "Could not load websites.");
  return data || [];
}

export async function listDashboardWebsites(supabase) {
  const { data, error } = await supabase.rpc("get_owned_website_dashboard");
  if (error) throw mapDatabaseError(error, "Could not load website security state.");
  return data || [];
}

export async function getWebsite(supabase, id) {
  const { data, error } = await supabase
    .from("websites")
    .select("id,user_id,name,url,domain,authorization_confirmed,authorization_confirmed_at,created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Could not load website.");
  return data;
}

export async function insertWebsite(supabase, values) {
  const { data, error } = await supabase
    .from("websites")
    .insert(values)
    .select("id,user_id,name,url,domain,authorization_confirmed,authorization_confirmed_at,created_at")
    .single();

  if (error) throw mapDatabaseError(error, "Could not create website.");
  return data;
}

export async function patchWebsite(supabase, id, values) {
  const { data, error } = await supabase
    .from("websites")
    .update(values)
    .eq("id", id)
    .select("id,user_id,name,url,domain,authorization_confirmed,authorization_confirmed_at,created_at")
    .single();

  if (error) throw mapDatabaseError(error, "Could not update website.");
  return data;
}

export async function removeWebsite(supabase, id) {
  const { error } = await supabase.from("websites").delete().eq("id", id);
  if (error) throw mapDatabaseError(error, "Could not delete website.");
}
