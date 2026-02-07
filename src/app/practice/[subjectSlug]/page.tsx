import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { PracticeSession } from "./PracticeSession";
import { Profile } from "@/types/database";
import { Frown } from "lucide-react";
import { decodeId } from "@/lib/ids";
import { NotFoundPage } from "@/components/ui/NotFoundPage";

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

export default async function PracticePage(props: PageProps) {
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
    .select("id, slug")
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
            description="We couldn't find the subject you're looking for. It might have been deleted or moved."
            backLink="/library"
            backText="Back to Library"
          />
        </div>
      </div>
    );
  }

  const questionSelect =
    "id, content, type, options, answer, explanation, code_snippet, topic_id, test_cases";

  const buildQuestionsQuery = (
    selectClause: string,
    selectOptions?: { count?: "exact"; head?: boolean },
  ) => {
    let query = supabase
      .from("questions")
      .select(selectClause, selectOptions)
      .eq("subject_id", subject.id);

    if (difficulty && difficulty !== "all") {
      query = query.eq("difficulty", difficulty);
    }

    if (topicSlug && topicSlug !== "all" && topicIds.length > 0) {
      query = query.in("topic_id", topicIds);
    }

    if (questionIds.length > 0) {
      query = query.in("id", questionIds);
    }

    return query;
  };

  let topicIds: number[] = [];
  if (topicSlug && topicSlug !== "all") {
    const slugs = topicSlug.split(",");
    const { data: topicsData } = await supabase
      .from("topics")
      .select("id")
      .in("slug", slugs);
    const topics = topicsData as { id: number }[] | null;
    if (topics && topics.length > 0) {
      topicIds = topics.map((t) => t.id);
    }
  }

  const questionIds =
    questions
      ?.split(",")
      .map((id) => decodeId(id))
      .filter((id) => id !== null) || [];

  let selectedQuestions: any[] = [];
  const questionCountStr = count || "10";

  if (questionIds.length > 0) {
    const { data: questionsById } = await buildQuestionsQuery(questionSelect)
      .order("id");
    selectedQuestions = questionsById || [];
  } else if (questionCountStr === "all") {
    const { data: allQuestions } = await buildQuestionsQuery(questionSelect)
      .order("id");
    selectedQuestions = allQuestions || [];
  } else {
    const { count: totalMatching } = await buildQuestionsQuery("id", {
      count: "exact",
      head: true,
    });

    if (totalMatching && totalMatching > 0) {
      const limit = Math.min(parseInt(questionCountStr, 10), totalMatching);
      const maxOffset = Math.max(totalMatching - limit, 0);
      const offset =
        maxOffset > 0 ? Math.floor(Math.random() * (maxOffset + 1)) : 0;

      const { data: questionsPage } = await buildQuestionsQuery(questionSelect)
        .order("id")
        .range(offset, offset + limit - 1);
      selectedQuestions = questionsPage || [];
    }
  }

  if (selectedQuestions.length === 0) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />

        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="No Questions Found"
            description="We couldn't find any questions matching your filters."
            backLink={`/practice/${subjectSlug}/setup`}
            backText="Adjust Filters"
          />
        </div>
      </div>
    );
  }

  if (questionCountStr !== "all") {
    const limit = parseInt(questionCountStr, 10);
    if (selectedQuestions.length > limit) {
      selectedQuestions = selectedQuestions
        .sort(() => 0.5 - Math.random())
        .slice(0, limit);
    }
  }

  // Fetch user profile for header
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

  // Explicit type assertion to fix build error
  const profile = profileData as Profile | null;

  const userData = {
    username:
      profile?.username ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User",
    avatar_url:
      profile?.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      undefined,
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
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <AmbientBackground />
      <PracticeSession
        questions={selectedQuestions}
        user={sessionUser}
        subjectId={subject.id}
        enableTimer={searchParamsStr.timer !== "false"}
        exitLink={`/library/${subjectSlug}`}
      />
    </div>
  );
}
