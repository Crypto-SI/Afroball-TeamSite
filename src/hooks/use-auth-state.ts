"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

/**
 * Tracks whether a user is currently authenticated via Supabase.
 * Returns `false` by default and updates once the session is resolved.
 */
export function useAuthState() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!hasSupabaseEnv()) return;

    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    }).catch(() => {
      setIsLoggedIn(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return isLoggedIn;
}
