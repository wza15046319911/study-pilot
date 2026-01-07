import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import ImmersiveSession from "./ImmersiveSession";
import { Profile, Question, Subject } from "@/types/database";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
  }>;
}

export default async function ImmersivePracticePage(props: PageProps) {
  const params = await props.params;
  const { subjectSlug } = params;

  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!subjectSlug) {
    redirect("/library");
  }

  // Fetch subject to ensure it exists
  const { data: subjectData } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", subjectSlug)
    .single();

  const subject = subjectData as Subject | null;

  if (!subject) {
    redirect("/library");
  }

  // Fetch first random question
  const { data: firstQuestionData } = await supabase
    .from("questions")
    .select("*")
    .eq("subject_id", subject.id)
    .limit(1);

  const firstQuestion = (firstQuestionData?.[0] as any as Question) || null;

  // Fetch user profile for session
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  const userData = {
    username: profile?.username || user.email?.split("@")[0] || "User",
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: profile?.is_vip || false,
  };

  const sessionUser = profile || {
    id: user.id,
    username: userData.username,
    level: 1,
    streak_days: 0,
    avatar_url: null,
    created_at: new Date().toISOString(),
    last_practice_date: null,
    is_vip: false,
    vip_expires_at: null,
    active_session_id: null,
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white">
      <AmbientBackground />
      <Header user={userData} />
      <ImmersiveSession
        initialQuestion={firstQuestion}
        subjectId={subject.id}
        subjectName={subject.name}
        user={sessionUser}
      />
    </div>
  );
}
