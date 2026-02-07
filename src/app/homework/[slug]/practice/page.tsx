import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { PracticeSession } from "@/app/practice/[subjectSlug]/PracticeSession";
import { NotFoundPage } from "@/components/ui/NotFoundPage";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function HomeworkPracticePage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/homework/${slug}/practice`);
  }

  const { data: homework, error: homeworkError } = await (
    supabase.from("homeworks") as any
  )
    .select("id, slug, subject_id, due_at, allowed_modes")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!homework || homeworkError) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc] dark:bg-slate-950">
        <AmbientBackground />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="Homework Not Found"
            description="The homework you are trying to access does not exist."
            backLink="/profile/homework"
            backText="Back to Homework"
          />
        </div>
      </div>
    );
  }

  const { data: profile } = await (supabase.from("profiles") as any)
    .select("is_vip")
    .eq("id", user.id)
    .single();

  if (!profile?.is_vip) {
    redirect("/pricing");
  }

  const { data: assignment } = await supabase
    .from("homework_assignments")
    .select("id")
    .eq("user_id", user.id)
    .eq("homework_id", homework.id)
    .single();

  if (!assignment) {
    redirect("/profile/homework");
  }

  if (homework.allowed_modes && !homework.allowed_modes.includes("standard")) {
    redirect("/profile/homework");
  }

  const { data: items } = await supabase
    .from("homework_items")
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
    .eq("homework_id", homework.id)
    .order("order_index");

  const questions = (items || []).map((item: any) => item.question);

  if (questions.length === 0) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="Empty Homework"
            description="This homework has no questions yet."
            backLink="/profile/homework"
            backText="Back to Homework"
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
    is_vip: true,
    vip_expires_at: null,
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <AmbientBackground />
      <PracticeSession
        questions={questions}
        user={sessionUser}
        subjectId={homework.subject_id}
        mode="practice"
        exitLink="/profile/homework"
        homeworkId={homework.id}
        homeworkMode="practice"
        showTopics={false}
      />
    </div>
  );
}
