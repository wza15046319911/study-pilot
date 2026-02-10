import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MistakesClient from "./MistakesClient";
import { Header } from "@/components/layout/Header";
// import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Profile } from "@/types/database";
import { getTranslations } from "next-intl/server";

export default async function MistakesPage() {
  const t = await getTranslations("profileMistakes.page");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile for Header
  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, is_vip")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  // Header user data construction
  const rawProfile = profile || {
    id: user.id,
    username: user.email?.split("@")[0] || t("fallbackUser"),
    email: user.email,
    level: 1,
    streak_days: 0,
    avatar_url: null,
    created_at: new Date().toISOString(),
    last_practice_date: null,
    is_vip: false,
    vip_expires_at: null,
  };

  const userData = {
    ...rawProfile,
    avatar_url:
      rawProfile.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null,
  };

  const headerUser = {
    username: userData.username || user.user_metadata?.name || t("fallbackUser"),
    avatar_url:
      userData.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      undefined,
    is_vip: userData.is_vip,
  };

  // Fetch mistakes with question details
  const { data: mistakes } = await supabase
    .from("mistakes")
    .select(
      `
      id,
      question_id,
      last_wrong_answer,
      error_count,
      created_at,
      questions!inner (
        id,
        title,
        content,
        difficulty,
        type,
        answer,
        options,
        subject_id,
        topic_id,
        tags,
        subjects!inner (
          id,
          name,
          slug
        ),
        topics (
          id,
          name
        )
      )
    `
    )
    .eq("user_id", user.id)
    .order("last_error_at", { ascending: false });

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* <AmbientBackground /> */}
      <Header user={headerUser} />
      <main className="flex-grow flex flex-col w-full">
        <MistakesClient
          mistakes={mistakes || []}
          userId={user.id}
          isVip={Boolean(userData.is_vip)}
        />
      </main>
    </div>
  );
}
