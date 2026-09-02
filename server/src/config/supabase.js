import { createClient } from "@supabase/supabase-js";
import { assertSupabaseEnv, assertSystemSupabaseEnv, env } from "./env.js";

export function createUserSupabaseClient(accessToken) {
  assertSupabaseEnv();
  return createClient(env.supabaseUrl, env.supabasePublicKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  });
}

let systemClient = null;

export function getSystemSupabaseClient() {
  if (!env.supabaseSecretKey) return null;
  if (!systemClient) {
    assertSystemSupabaseEnv();
    systemClient = createClient(env.supabaseUrl, env.supabaseSecretKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
  }
  return systemClient;
}
