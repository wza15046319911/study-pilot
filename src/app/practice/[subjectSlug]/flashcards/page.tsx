import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import FlashcardSession from "./FlashcardSession";
import { Profile, Question, Subject } from "@/types/database";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
  }>;
}

export default async function FlashcardsPage(props: PageProps) {
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
    redirect("/subjects");
  }

  // Fetch subject to ensure it exists
  const { data: subjectData } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", subjectSlug)
    .single();

  const subject = subjectData as Subject | null;

  if (!subject) {
    redirect("/subjects");
  }

  // Fetch questions for flashcards (Limit to 50)
  // We prioritize questions due for review or new ones
  const { data: questionsData } = await supabase
    .from("questions")
    .select("*, flashcard_reviews(*)")
    .eq("subject_id", subject.id)
    .limit(50); // Simple limit for MVP

  const questions = (questionsData || []).map((q: any) => ({
    ...q,
    // Add review data if it exists (single user due to RLS)
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
