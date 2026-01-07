"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const LOCAL_SESSION_KEY = "studypilot_active_session_id";

type ProfileRealtimePayload = RealtimePostgresChangesPayload<{
  active_session_id: string | null;
}>;

export default function SessionGuard() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let channel: RealtimeChannel | null = null;
    let isMounted = true;

    const syncLocalSessionId = async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("active_session_id")
        .eq("id", userId)
        .single();

      if (!error && data?.active_session_id) {
        window.localStorage.setItem(
          LOCAL_SESSION_KEY,
          data.active_session_id
        );
        return data.active_session_id;
      }

      window.localStorage.removeItem(LOCAL_SESSION_KEY);
      return null;
    };

    const listenForKicks = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (!user) {
        window.localStorage.removeItem(LOCAL_SESSION_KEY);
        return;
      }

      await syncLocalSessionId(user.id);

      channel = supabase
        .channel(`session-guard:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          async (payload: ProfileRealtimePayload) => {
            const newSessionId = payload.new?.active_session_id;
            if (!newSessionId) {
              return;
            }

            const currentSessionId = window.localStorage.getItem(
              LOCAL_SESSION_KEY
            );

            if (!currentSessionId) {
              window.localStorage.setItem(LOCAL_SESSION_KEY, newSessionId);
              return;
            }

            if (currentSessionId === newSessionId) {
              return;
            }

            await supabase.auth.signOut();
            window.localStorage.removeItem(LOCAL_SESSION_KEY);
            alert("Your account was signed in on another device.");
            router.replace("/login?forced=1");
          }
        )
        .subscribe();
    };

    void listenForKicks();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [router, supabase]);

  return null;
}
