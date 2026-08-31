import { HttpError } from "../utils/HttpError.js";

function mapDatabaseError(error, fallback) {
  if (!error) return null;
  if (error.code === "23505") {
    return new HttpError(
      409,
      "This website is already saved in your account.",
      "WEBSITE_DUPLICATE"
    );
  }
  return new HttpError(500, fallback, "DATABASE_ERROR");
}

export async function listWebsites(supabase) {
  const { data, error } = await supabase
    .from("websites")
    .select(
      "id,user_id,name,url,domain,authorization_confirmed,authorization_confirmed_at,created_at"
    )
    .order("created_at", { ascending: false });

  if (error) throw mapDatabaseError(error, "Could not load websites.");
  return data || [];
}

export async function getWebsite(supabase, id) {
  const { data, error } = await supabase
    .from("websites")
    .select(
      "id,user_id,name,url,domain,authorization_confirmed,authorization_confirmed_at,created_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Could not load website.");
  return data;
}

export async function getLatestScoredScan(supabase, websiteId) {
  const { data, error } = await supabase
    .from("scans")
    .select("id,status,score,risk_level,created_at,completed_at")
    .eq("website_id", websiteId)
    .not("score", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw mapDatabaseError(error, "Could not load the latest website score.");
  }
  return data;
}

export async function insertWebsite(supabase, values) {
  const { data, error } = await supabase
    .from("websites")
    .insert(values)
    .select(
      "id,user_id,name,url,domain,authorization_confirmed,authorization_confirmed_at,created_at"
    )
    .single();

  if (error) throw mapDatabaseError(error, "Could not create website.");
  return data;
}

export async function patchWebsite(supabase, id, values) {
  const { data, error } = await supabase
    .from("websites")
    .update(values)
    .eq("id", id)
    .select(
      "id,user_id,name,url,domain,authorization_confirmed,authorization_confirmed_at,created_at"
    )
    .single();

  if (error) throw mapDatabaseError(error, "Could not update website.");
  return data;
}

export async function removeWebsite(supabase, id) {
  const { error } = await supabase.from("websites").delete().eq("id", id);
  if (error) throw mapDatabaseError(error, "Could not delete website.");
}
