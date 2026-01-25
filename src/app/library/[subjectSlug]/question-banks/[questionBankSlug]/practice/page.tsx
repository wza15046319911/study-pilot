import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { PracticeSession } from "@/app/practice/[subjectSlug]/PracticeSession";
import { Profile } from "@/types/database";
import { NotFoundPage } from "@/components/ui/NotFoundPage";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
    questionBankSlug: string;
  }>;
}

export default async function LibraryQuestionBankPracticePage(
  props: PageProps,
) {
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
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
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

  // Fetch user profile for access check + session data
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  // Check access for non-public banks
  let isUnlocked = false;
  if (bank.unlock_type === "free") {
    isUnlocked = true;
  } else if (bank.unlock_type === "premium" && profile?.is_vip) {
    isUnlocked = true;
  } else {
    const { data: unlock } = await (supabase.from("user_bank_unlocks") as any)
      .select("id")
      .eq("user_id", user.id)
      .eq("bank_id", bank.id)
      .single();

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
    .select("question:questions(*)")
    .eq("bank_id", bank.id)
    .order("order_index");

  const questions = (items || []).map((item: any) => item.question);

  if (questions.length === 0) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="No Questions"
            description="This question bank doesn't have any questions yet."
            backLink={`/library/${subjectSlug}/question-banks/${questionBankSlug}`}
            backText="Back to Question Bank"
          />
        </div>
      </div>
    );
  }

  const sessionUser = profile || {
    id: user.id,
    username: user.email?.split("@")[0] || "User",
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
