import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import ImmersiveSession from "@/app/practice/[subjectSlug]/immersive/ImmersiveSession";
import { Profile, Question, Subject } from "@/types/database";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
    questionBankSlug: string;
  }>;
}

type ImmersiveItemRow = {
  question: Question | null;
};

export default async function LibraryQuestionBankImmersivePage(
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
      `/login?next=/library/${subjectSlug}/question-banks/${questionBankSlug}/immersive`,
    );
  }

  // Fetch subject
  const { data: subjectData } = await supabase
    .from("subjects")
    .select("id, slug, name, icon")
    .eq("slug", subjectSlug)
    .single();

  const subject = subjectData as Subject | null;

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
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white dark:bg-slate-950">
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

  // Fetch first question from bank (ImmersiveSession fetches more dynamically)
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
        test_cases,
        topic_id
      )
    `,
    )
    .eq("bank_id", bankData.id)
    .order("order_index")
    .limit(1);

  const firstQuestion =
    (((items as ImmersiveItemRow[] | null)?.[0] as ImmersiveItemRow | undefined)
      ?.question as Question | null) || null;

  // Fetch user profile for session
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
    username: profile?.username || user.email?.split("@")[0] || "User",
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: profile?.is_vip || false,
  };

  const sessionUser = profile || {
    id: user.id,
    username: userData.username || t("fallbackUser"),
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
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white dark:bg-slate-950">
      <AmbientBackground />
      <Header user={userData} />
      <ImmersiveSession
        initialQuestion={firstQuestion}
        subjectId={subject.id}
        subjectName={`${bankData.title} - ${subject.name}`}
        user={sessionUser}
      />
    </div>
  );
}
