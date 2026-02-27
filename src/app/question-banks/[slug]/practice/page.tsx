import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { PracticeSession } from "@/app/practice/[subjectSlug]/PracticeSession";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { decodeId, slugOrEncodedId } from "@/lib/ids";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function QuestionBankPracticePage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const decodedBankId = decodeId(slug);
  const supabase = await createClient();

  // Check Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/question-banks/${slug}/practice`);
  }

  // Fetch Bank Metadata
  let { data: bank, error: bankError } = await (
    supabase.from("question_banks") as any
  )
    .select("id, slug, subject_id, is_premium, unlock_type, visibility")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!bank && decodedBankId !== null) {
    const fallbackResult = await (supabase.from("question_banks") as any)
      .select("id, slug, subject_id, is_premium, unlock_type, visibility")
      .eq("id", decodedBankId)
      .eq("is_published", true)
      .maybeSingle();
    bank = fallbackResult.data;
    bankError = fallbackResult.error;
  }

  if (!bank || bankError) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc] dark:bg-slate-950">
        <AmbientBackground />

        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="Question Bank Not Found"
            description="The question bank you are trying to access does not exist."
            backLink="/question-banks"
            backText="Back to Question Banks"
          />
        </div>
      </div>
    );
  }

  // Fetch user profile once for access check + session/header data
  const { data: profileData } = await (supabase.from("profiles") as any)
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

  const profile = profileData as any;
  const bankRouteId = slugOrEncodedId(bank.slug, bank.id);

  // Check Access (Strict Check)
  let isUnlocked = false;

  const { data: distributionResult } = await supabase
    .from("distributions")
    .select("id, distribution_users!inner(user_id)")
    .eq("target_type", "question_bank")
    .eq("target_id", bank.id)
    .eq("distribution_users.user_id", user.id)
    .maybeSingle();

  if (bank.visibility === "assigned_only" && !distributionResult) {
    redirect(`/question-banks/${bankRouteId}`);
  }

  if (distributionResult) {
    isUnlocked = true;
  } else if (!bank.is_premium && bank.unlock_type === "free") {
    isUnlocked = true;
  } else {
    if (bank.is_premium && profile?.is_vip) {
      isUnlocked = true;
    } else {
      // Check for specific unlocks
      const { data: unlock } = await supabase
        .from("user_bank_unlocks")
        .select("id")
        .eq("user_id", user.id)
        .eq("bank_id", bank.id)
        .maybeSingle();

      if (unlock) {
        isUnlocked = true;
      }
    }
  }

  if (!isUnlocked) {
    redirect(`/question-banks/${bankRouteId}`);
  }

  // Fetch Questions in Order
  const { data: items } = await supabase
    .from("question_bank_items")
    .select(
      `
      order_index,
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
    .eq("bank_id", bank.id)
    .order("order_index");

  const questions = (items || []).map((item: any) => item.question);

  if (questions.length === 0) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />

        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="Empty Bank"
            description="This question bank has no questions yet."
            backLink={`/question-banks/${bankRouteId}`}
            backText="Back to Preview"
          />
        </div>
      </div>
    );
  }

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
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <AmbientBackground />
      <PracticeSession
        questions={questions}
        user={sessionUser}
        subjectId={bank.subject_id}
        mode="practice"
        exitLink={`/question-banks/${bankRouteId}`}
      />
    </div>
  );
}
