"use client";

import { useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import type { Profile } from "@/types/database";

const PROFILE_FIELDS = "id, username, avatar_url, is_vip, is_admin";

export default function AuthBootstrap() {
  const supabase = useMemo(() => createClient(), []);
  const setAuthState = useAuthStore((state) => state.setAuthState);
  const setLoading = useAuthStore((state) => state.setLoading);
  const reset = useAuthStore((state) => state.reset);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async (): Promise<Profile | null> => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return null;
      }

      const { data: profile, error: profileError } = await (
        supabase.from("profiles") as any
      )
        .select(PROFILE_FIELDS)
        .eq("id", user.id)
        .single();

      if (profileError) {
        return null;
      }

      return profile as Profile;
    };

    const bootstrap = async () => {
      setLoading(true);
      const profile = await loadProfile();
      if (!isMounted) return;
      if (profile) {
        setAuthState(profile);
      } else {
        reset();
      }
      setLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "SIGNED_OUT") {
          reset();
          return;
        }

        const profile = await loadProfile();
        if (!isMounted) return;
        if (profile) {
          setAuthState(profile);
        } else {
          reset();
        }
      }
    );

    void bootstrap();

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [reset, setAuthState, setLoading, supabase]);

  return null;
}
