import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { PracticeSession } from "@/app/practice/[subjectSlug]/PracticeSession";
import { Profile, Question } from "@/types/database";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
    questionBankSlug: string;
  }>;
}

type QuestionBankItemRow = { question: Record<string, unknown> | null };

export default async function LibraryQuestionBankPracticePage(
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
      `/login?next=/library/${subjectSlug}/question-banks/${questionBankSlug}/practice`,
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
    .select("id, slug, title, subject_id, unlock_type, is_premium")
    .eq("slug", questionBankSlug)
    .eq("subject_id", subject.id)
    .maybeSingle();

  if (!bank) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
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

  const bankData = bank as { id: number; slug: string; title: string; subject_id: number; unlock_type: string; is_premium: boolean };

  // Fetch user profile for access check + session data
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

  // Check access for non-public banks
  let isUnlocked = false;
  if (bankData.unlock_type === "free") {
    isUnlocked = true;
  } else if (bankData.unlock_type === "premium" && profile?.is_vip) {
    isUnlocked = true;
  } else {
    const { data: unlock } = await supabase
      .from("user_bank_unlocks")
      .select("id")
      .eq("user_id", user.id)
      .eq("bank_id", bankData.id)
      .maybeSingle();

    if (unlock) {
      isUnlocked = true;
    }
  }

  if (!isUnlocked) {
    redirect(`/library/${subjectSlug}/question-banks/${questionBankSlug}`);
  }

  // Fetch Questions in Order
  const { data: items } = await supabase
    .from("question_bank_items")
    .select(
      `
      question:questions(
        id,
        content,
        type,
        options,
        answer,
        explanation,
        code_snippet,
        topic_id,
        test_cases
      )
    `,
    )
    .eq("bank_id", bankData.id)
    .order("order_index");

  const questions = ((items as QuestionBankItemRow[] | null) || [])
    .map((item) => item.question)
    .filter((q): q is NonNullable<typeof q> => q != null) as Question[];

  if (questions.length === 0) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title={t("questionBankNoQuestions.title")}
            description={t("questionBankNoQuestions.description")}
            backLink={`/library/${subjectSlug}/question-banks/${questionBankSlug}`}
            backText={t("questionBankNoQuestions.backToQuestionBank")}
          />
        </div>
      </div>
    );
  }

  const sessionUser = profile || {
    id: user.id,
    username: user.email?.split("@")[0] || t("fallbackUser"),
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
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <AmbientBackground />
      <PracticeSession
        questions={questions}
        user={sessionUser}
        subjectId={subject.id}
        enableTimer={true}
        exitLink={`/library/${subjectSlug}/question-banks/${questionBankSlug}`}
      />
    </div>
  );
}
