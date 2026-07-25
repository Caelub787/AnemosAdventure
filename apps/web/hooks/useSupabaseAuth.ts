"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@arcanavtt/data-access/client";

/** Client-side session info needed to authenticate the Hocuspocus WebSocket connection. */
export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAccessToken(data.session?.access_token ?? null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  return { user, accessToken };
}
