import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import FlashcardSession from "@/app/practice/[subjectSlug]/flashcards/FlashcardSession";
import { Profile, Question, Subject } from "@/types/database";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
  }>;
}

export default async function LibraryFlashcardsPage(props: PageProps) {
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

  // Fetch questions for flashcards (Limit to 50)
  const { data: questionsData } = await supabase
    .from("questions")
    .select("*, flashcard_reviews(*)")
    .eq("subject_id", subject.id)
    .limit(50);

  const questions = (questionsData || []).map((q: any) => ({
    ...q,
    review: q.flashcard_reviews?.[0] || null,
  })) as (Question & { review: any })[];

  // Fetch user profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;
  const userData = {
    username: profile?.username || "User",
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
    is_admin: false,
    email_notifications_enabled: true,
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc] dark:bg-[#0d121b]">
      <AmbientBackground />
      <Header user={userData} />
      <FlashcardSession
        questions={questions}
        user={sessionUser}
        subjectId={subject.id}
        subjectName={subject.name}
      />
    </div>
  );
}
