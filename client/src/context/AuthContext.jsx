import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase, supabaseConfigured } from "../config/supabase";
import { AuthContext } from "./authContextValue";
import { getMe } from "../services/api";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [authStatus, setAuthStatus] = useState(supabaseConfigured && supabase ? "checking" : "unauthenticated");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      return undefined;
    }

    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      if (error) {
        console.error("Could not restore Supabase session:", error.message);
        setSession(null);
        setAuthStatus("unauthenticated");
        return;
      }

      setSession(data.session);
      setAuthStatus(data.session ? "authenticated" : "unauthenticated");
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthStatus(nextSession ? "authenticated" : "unauthenticated");
      if (!nextSession) setProfile(null);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  const refreshProfile = useCallback(async () => {
    if (!session) return null;
    const data = await getMe();
    setProfile(data.profile);
    return data.profile;
  }, [session]);

  useEffect(() => {
    if (!session) {
      return undefined;
    }
    let active = true;
    getMe().then((data) => { if (active) setProfile(data.profile); }).catch(() => { if (active) setProfile(null); });
    return () => { active = false; };
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      profile,
      authStatus,
      logout,
      supabaseConfigured,
      refreshProfile
    }),
    [session, authStatus, profile, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
