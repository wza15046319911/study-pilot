import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { PracticeSession } from "@/app/practice/[subjectSlug]/PracticeSession";
import { Profile } from "@/types/database";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { decodeId } from "@/lib/ids";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
  }>;
  searchParams: Promise<{
    difficulty?: string;
    count?: string;
    topic?: string;
    timer?: string;
    questions?: string;
  }>;
}

export default async function LibraryPracticePage(props: PageProps) {
  const searchParamsStr = await props.searchParams;
  const params = await props.params;

  const {
    difficulty,
    count,
    topic: topicSlug,
    timer,
    questions,
  } = searchParamsStr;

  const { subjectSlug } = params;

  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch subject to ensure it exists.
  if (!subjectSlug) {
    redirect("/library");
  }

  // Fetch subject by slug
  const { data: subjectData } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", subjectSlug)
    .single();

  const subject = subjectData as { id: number; slug: string } | null;

  if (!subject) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />

        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="Subject Not Found"
            description="We couldn't find the subject you're looking for."
            backLink="/library"
            backText="Back to Library"
          />
        </div>
      </div>
    );
  }

  // Fetch questions based on filters
  let query = supabase
    .from("questions")
    .select("*")
    .eq("subject_id", subject.id);

  if (difficulty && difficulty !== "all") {
    query = query.eq("difficulty", difficulty);
  }

  if (topicSlug && topicSlug !== "all") {
    const slugs = topicSlug.split(",");

    const { data: topicsData } = await supabase
      .from("topics")
      .select("id")
      .in("slug", slugs);

    const topics = topicsData as { id: number }[] | null;

    if (topics && topics.length > 0) {
      const topicIds = topics.map((t) => t.id);
      query = query.in("topic_id", topicIds);
    }
  }

  // Filter by specific question IDs if provided
  if (questions) {
    const questionIds = questions
      .split(",")
      .map((id) => decodeId(id))
      .filter((id) => id !== null) as number[];

    if (questionIds.length > 0) {
      query = query.in("id", questionIds);
    }
  }

  const { data: allQuestions } = await query;

  if (!allQuestions || allQuestions.length === 0) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />

        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="No Questions Found"
            description="We couldn't find any questions matching your filters."
            backLink={`/library/${subjectSlug}/setup`}
            backText="Adjust Filters"
          />
        </div>
      </div>
    );
  }

  // Shuffle and slice questions
  const questionCountStr = count || "10";
  let selectedQuestions = [...allQuestions];

  if (questionCountStr !== "all") {
    const limit = parseInt(questionCountStr);
    selectedQuestions = selectedQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, limit);
  }

  if (questionCountStr === "all") {
    selectedQuestions = selectedQuestions.sort(() => 0.5 - Math.random());
  }

  // Fetch user profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

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
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <AmbientBackground />
      <PracticeSession
        questions={selectedQuestions}
        user={sessionUser}
        subjectId={subject.id}
        enableTimer={searchParamsStr.timer !== "false"}
      />
    </div>
  );
}
