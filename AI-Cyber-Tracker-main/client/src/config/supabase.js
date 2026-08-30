import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublicKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim();

export const supabaseConfigured = Boolean(supabaseUrl && supabasePublicKey);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabasePublicKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export function requireSupabaseClient() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Copy client/.env.example to client/.env and add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or the legacy anon key)."
    );
  }

  return supabase;
}
