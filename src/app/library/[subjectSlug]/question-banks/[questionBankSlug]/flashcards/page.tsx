import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import FlashcardSession from "@/app/practice/[subjectSlug]/flashcards/FlashcardSession";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { Profile, Question } from "@/types/database";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
    questionBankSlug: string;
  }>;
}

type QuestionBankFlashcardItemRow = {
  question: {
    id: number;
    title: string;
    content: string;
    answer: string;
    explanation: string | null;
    type: string;
    options: string[] | null;
    code_snippet: string | null;
    topic_id: number | null;
    subject_id: number | null;
    difficulty: string | null;
  } | null;
};

export default async function LibraryQuestionBankFlashcardsPage(
  props: PageProps,
) {
  const t = await getTranslations("libraryErrors");
  const params = await props.params;
  const { subjectSlug, questionBankSlug } = params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?next=/library/${subjectSlug}/question-banks/${questionBankSlug}/flashcards`,
    );
  }

  // Fetch subject
  const { data: subjectData } = await supabase
    .from("subjects")
    .select("id, slug, name, icon")
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
  const { data: bank } = await supabase
    .from("question_banks")
    .select("id, slug, title, subject_id")
    .eq("slug", questionBankSlug)
    .eq("subject_id", subject.id)
    .maybeSingle();

  if (!bank) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc] dark:bg-[#0d121b]">
        <AmbientBackground />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title={t("questionBankNotFound.title")}
            description={t("questionBankNotFound.description")}
            backLink={`/library/${subjectSlug}`}
            backText={t("questionBankNotFound.backToSubject")}
          />
        </div>
      </div>
    );
  }

  const bankData = bank as { id: number; slug: string; title: string; subject_id: number };

  // Fetch only fields needed by flashcard session
  const { data: items } = await supabase
    .from("question_bank_items")
    .select(
      `
      question:questions(
        id,
        title,
        content,
        answer,
        explanation,
        type,
        options,
        code_snippet,
        topic_id,
        subject_id,
        difficulty
      )
    `,
    )
    .eq("bank_id", bankData.id)
    .order("order_index");

  const questions = ((items as QuestionBankFlashcardItemRow[] | null) || [])
    .map((item) => item.question)
    .filter((q): q is NonNullable<typeof q> => q != null)
    .map((question) => ({
      ...question,
      review: null,
      tags: null,
      test_cases: null,
      created_at: new Date().toISOString(),
    })) as (Question & { review: null })[];

  // Fetch user profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select(
      [
        "id",
        "username",
        "level",
        "streak_days",
        "avatar_url",
        "created_at",
        "last_practice_date",
        "is_vip",
        "vip_expires_at",
        "active_session_id",
        "is_admin",
      ].join(", "),
    )
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;
  const userData = {
    username: profile?.username || t("fallbackUser"),
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
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc] dark:bg-[#0d121b]">
      <AmbientBackground />
      <Header user={userData} />
      <FlashcardSession
        questions={questions}
        user={sessionUser}
        subjectId={subject.id}
        subjectName={`${bankData.title} - ${subject.name}`}
      />
    </div>
  );
}
