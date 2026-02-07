import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { PracticeSession } from "@/app/practice/[subjectSlug]/PracticeSession";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { decodeId } from "@/lib/ids";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function WeeklyPracticeSessionPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const decodedWeeklyPracticeId = decodeId(slug);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/weekly-practice/${slug}/practice`);
  }

  let { data: weeklyPractice, error } = await (
    supabase.from("weekly_practices") as any
  )
    .select("id, slug, subject_id, allowed_modes")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!weeklyPractice && decodedWeeklyPracticeId !== null) {
    const fallbackResult = await (supabase.from("weekly_practices") as any)
      .select("id, slug, subject_id, allowed_modes")
      .eq("id", decodedWeeklyPracticeId)
      .eq("is_published", true)
      .maybeSingle();
    weeklyPractice = fallbackResult.data;
    error = fallbackResult.error;
  }

  if (!weeklyPractice || error) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc] dark:bg-slate-950">
        <AmbientBackground />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="Weekly Practice Not Found"
            description="The weekly practice you are trying to access does not exist."
            backLink="/profile/weekly-practice"
            backText="Back to Weekly Practice"
          />
        </div>
      </div>
    );
  }

  if (
    weeklyPractice.allowed_modes &&
    !weeklyPractice.allowed_modes.includes("standard")
  ) {
    redirect("/profile/weekly-practice");
  }

  const { data: items } = await supabase
    .from("weekly_practice_items")
    .select(
      `
      question_id,
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
    .eq("weekly_practice_id", weeklyPractice.id)
    .order("order_index");

  const questions = (items || []).map((item: any) => item.question);

  if (questions.length === 0) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="Empty Weekly Practice"
            description="This weekly practice has no questions yet."
            backLink="/profile/weekly-practice"
            backText="Back to Weekly Practice"
          />
        </div>
      </div>
    );
  }

  const { data: headerProfile } = await (supabase.from("profiles") as any)
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

  const sessionUser = headerProfile || {
    id: user.id,
    username: user.email?.split("@")[0] || "User",
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
        subjectId={weeklyPractice.subject_id}
        mode="practice"
        exitLink="/profile/weekly-practice"
        weeklyPracticeId={weeklyPractice.id}
        weeklyPracticeMode="practice"
        showTopics={false}
      />
    </div>
  );
}
