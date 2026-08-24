import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface Profile {
  id: string;
  full_name: string | null;
  role: "user" | "admin";
}

interface AuthState {
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    loading: true,
    session: null,
    profile: null,
  });

  useEffect(() => {
    let mounted = true;

    async function loadProfile(session: Session | null) {
      if (!session) {
        if (mounted) setState({ loading: false, session: null, profile: null });
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", session.user.id)
        .single();
      if (mounted) {
        setState({ loading: false, session, profile: (profile as Profile) ?? null });
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => loadProfile(session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
