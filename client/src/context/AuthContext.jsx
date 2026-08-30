import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, supabaseConfigured } from "../config/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [authStatus, setAuthStatus] = useState("checking");

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      setSession(null);
      setAuthStatus("unauthenticated");
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

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      authStatus,
      logout,
      supabaseConfigured
    }),
    [session, authStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
