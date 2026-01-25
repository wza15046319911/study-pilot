import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
// import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { ProgressClient, SubjectWithTopics, TagStat } from "./ProgressClient";
import { Subject, Topic } from "@/types/database";

export default async function ProgressPage() {
  const supabase = await createClient();

  // 1. Auth Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profilePromise = supabase
    .from("profiles")
    .select("id, username, avatar_url, is_vip")
    .eq("id", user.id)
    .single();

  const subjectsPromise = supabase
    .from("subjects")
    .select("id, name, slug")
    .order("name");

  const topicsPromise = supabase
    .from("topics")
    .select("id, name, slug, subject_id, questions(count)")
    .order("name");

  const topicProgressPromise = supabase
    .from("topic_progress")
    .select("topic_id, completed_count, correct_count")
    .eq("user_id", user.id);

  const userAnswersPromise = supabase
    .from("user_answers")
    .select(
      `
      is_correct,
      questions!inner (
        tags
      )
    `,
    )
    .eq("user_id", user.id);

  const [
    profileResult,
    subjectsResult,
    topicsResult,
    topicProgressResult,
    userAnswersResult,
  ] = await Promise.all([
    profilePromise,
    subjectsPromise,
    topicsPromise,
    topicProgressPromise,
    userAnswersPromise,
  ]);

  const profile = profileResult.data;
  const userForHeader = {
    username: (profile as any)?.username || user.user_metadata?.name || "User",
    avatar_url:
      (profile as any)?.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      undefined,
    is_vip: (profile as any)?.is_vip || false,
  };

  const subjectsData = subjectsResult.data;
  const topicsData = topicsResult.data;
  const userAnswersData = userAnswersResult.data as any[] | null;

  // --- Data Processing ---

  // A. Calculate Topic Progress from topic_progress
  const topicProgressMap = new Map<
    number,
    { correct_count: number; completed_count: number }
  >();

  (topicProgressResult.data || []).forEach((stats: any) => {
    if (!stats.topic_id) return;
    topicProgressMap.set(stats.topic_id, {
      correct_count: stats.correct_count || 0,
      completed_count: stats.completed_count || 0,
    });
  });

  // B. Build Subjects with Topics and Progress
  const subjectsWithTopics: SubjectWithTopics[] = (subjectsData || []).map(
    (subject: Subject) => {
      const subjectTopics = (topicsData || [])
        .filter((topic: Topic) => topic.subject_id === subject.id)
        .map((topic: Topic) => {
          const progress = topicProgressMap.get(topic.id);
          // Flatten question count
          const qCount = (topic as any).questions?.[0]?.count || 0;

          return {
            ...topic,
            question_count: qCount,
            progress: progress
              ? {
                  correct_count: progress.correct_count,
                  completed_count: progress.completed_count,
                }
              : undefined,
          };
        });

      return {
        ...subject,
        topics: subjectTopics,
        // Aggregate subject progress from topics
        progress: subjectTopics.reduce(
          (acc, topic) => ({
            correct_count:
              acc.correct_count + (topic.progress?.correct_count || 0),
            completed_count:
              acc.completed_count + (topic.progress?.completed_count || 0),
          }),
          { correct_count: 0, completed_count: 0 }
        ),
      };
    }
  );

  // C. Process Tag Stats from user_answers
  const tagStatsMap = new Map<string, { total: number; correct: number }>();

  const answersWithTags = userAnswersData as unknown as
    | {
        is_correct: boolean;
        questions: {
          tags: string[] | null;
        } | null;
      }[]
    | null;

  (answersWithTags || []).forEach((answer) => {
    const tags = answer.questions?.tags || [];
    const isCorrect = answer.is_correct;

    if (Array.isArray(tags)) {
      tags.forEach((tag: string) => {
        const current = tagStatsMap.get(tag) || { total: 0, correct: 0 };
        tagStatsMap.set(tag, {
          total: current.total + 1,
          correct: current.correct + (isCorrect ? 1 : 0),
        });
      });
    }
  });

  const allTagStats: TagStat[] = Array.from(tagStatsMap.entries()).map(
    ([tag, stats]) => ({
      tag,
      total: stats.total,
      correct: stats.correct,
      accuracy:
        stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    })
  );

  // Sort by accuracy
  const weakTags = allTagStats
    .filter((s) => s.accuracy < 60 && s.total >= 3) // Minimum attempts filter
    .sort((a, b) => a.accuracy - b.accuracy); // Lowest accuracy first

  const strongTags = allTagStats
    .filter((s) => s.accuracy >= 80 && s.total >= 3)
    .sort((a, b) => b.accuracy - a.accuracy); // Highest accuracy first

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* <AmbientBackground /> */}
      <Header user={userForHeader} />

      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-8">
        <ProgressClient
          subjects={subjectsWithTopics}
          tagStats={{
            weak: weakTags,
            strong: strongTags,
            all: allTagStats,
          }}
        />
      </main>
    </div>
  );
}
