"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Profile } from "./types";

interface AuthState {
  loading: boolean;
  profile: Profile | null;
  isAdmin: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    loading: true,
    profile: null,
    isAdmin: false,
  });

  useEffect(() => {
    let mounted = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) setState({ loading: false, profile: null, isAdmin: false });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (mounted) {
        setState({
          loading: false,
          profile: profile as Profile | null,
          isAdmin: profile?.role === "admin",
        });
      }
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
