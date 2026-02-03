import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

type HeaderUser = {
  username: string;
  avatar_url?: string;
  is_vip?: boolean;
} | null;

export const getHeaderUser = cache(async (): Promise<HeaderUser> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await (supabase.from("profiles") as any)
    .select("username, avatar_url, is_vip")
    .eq("id", user.id)
    .single();

  return {
    username: profile?.username || user.email?.split("@")[0] || "User",
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: profile?.is_vip || false,
  };
});
