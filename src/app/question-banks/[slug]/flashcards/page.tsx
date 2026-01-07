import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import FlashcardSession from "@/app/practice/[subjectSlug]/flashcards/FlashcardSession";
import { Profile, Question } from "@/types/database";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function QuestionBankFlashcardsPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/question-banks/${slug}/flashcards`);
  }

  const { data: bank } = await (supabase.from("question_banks") as any)
    .select("*, subject:subjects(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (!bank) {
    redirect("/question-banks");
  }

  // Fetch Questions with flashcard_reviews
  const { data: items } = await supabase
    .from("question_bank_items")
    .select("question:questions(*, flashcard_reviews(*))")
    .eq("bank_id", bank.id)
    .order("order_index");

  const questions = (items || []).map((item: any) => ({
    ...item.question,
    review: item.question?.flashcard_reviews?.[0] || null,
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
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc] dark:bg-[#0d121b]">
      <AmbientBackground />
      <Header user={userData} />
      <FlashcardSession
        questions={questions}
        user={sessionUser}
        subjectId={bank.subject_id}
        subjectName={`${bank.title}`}
      />
    </div>
  );
}
