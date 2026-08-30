import { requireSupabaseClient } from "../config/supabase";

export async function registerUser({ name, email, password }) {
  const client = requireSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { name: name.trim() }
    }
  });

  if (error) throw error;
  return data;
}

export async function loginUser({ email, password }) {
  const client = requireSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password
  });

  if (error) throw error;
  return data;
}

export async function getAccessToken() {
  const client = requireSupabaseClient();
  const { data, error } = await client.auth.getSession();

  if (error) throw error;
  return data.session?.access_token || null;
}
