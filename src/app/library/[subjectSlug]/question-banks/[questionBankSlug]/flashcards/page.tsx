import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import FlashcardSession from "@/app/practice/[subjectSlug]/flashcards/FlashcardSession";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { Profile } from "@/types/database";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
    questionBankSlug: string;
  }>;
}

export default async function LibraryQuestionBankFlashcardsPage(
  props: PageProps
) {
  const params = await props.params;
  const { subjectSlug, questionBankSlug } = params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?next=/library/${subjectSlug}/question-banks/${questionBankSlug}/flashcards`
    );
  }

  // Fetch subject
  const { data: subjectData } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", subjectSlug)
    .single();

  const subject = subjectData as {
    id: number;
    slug: string;
    name: string;
    icon?: string;
  } | null;

  if (!subject) {
    redirect("/library");
  }

  // Fetch bank
  const { data: bank } = await (supabase.from("question_banks") as any)
    .select("*")
    .eq("slug", questionBankSlug)
    .eq("subject_id", subject.id)
    .maybeSingle();

  if (!bank) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc] dark:bg-[#0d121b]">
        <AmbientBackground />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="Question Bank Not Found"
            description="The question bank you're looking for doesn't exist."
            backLink={`/library/${subjectSlug}`}
            backText="Back to Subject"
          />
        </div>
      </div>
    );
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
  }));

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
        subjectName={`${bank.title} - ${subject.name}`}
      />
    </div>
  );
}
