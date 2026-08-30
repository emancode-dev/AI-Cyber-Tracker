import { createClient } from "@supabase/supabase-js";
import { assertSupabaseEnv, env } from "./env.js";

export function createUserSupabaseClient(accessToken) {
  assertSupabaseEnv();
  return createClient(env.supabaseUrl, env.supabasePublicKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  });
}
