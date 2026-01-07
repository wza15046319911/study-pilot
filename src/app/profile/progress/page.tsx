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

  // 2. Fetch User Profile for Header
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const userForHeader = {
    username: (profile as any)?.username || user.user_metadata?.name || "User",
    avatar_url:
      (profile as any)?.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      undefined,
    is_vip: (profile as any)?.is_vip || false,
  };

  // 3. Fetch Subjects and Topics
  const { data: subjectsData } = await supabase
    .from("subjects")
    .select("*")
    .order("name");

  const { data: topicsData } = await supabase
    .from("topics")
    .select("*, questions(count)")
    .order("name");

  // 4. Fetch User Answers with Question Details
  const { data: userAnswersData } = (await supabase
    .from("user_answers")
    .select(
      `
      is_correct,
      questions!inner (
        id,
        subject_id,
        topic_id,
        tags
      )
    `
    )
    .eq("user_id", user.id)) as { data: any[] | null };

  // --- Data Processing ---

  // A. Calculate Topic Progress from user_answers
  // A. Calculate Topic Progress from user_answers
  // Use map of Sets to track unique question IDs
  const topicStatsMap = new Map<
    number,
    { correctIds: Set<number>; completedIds: Set<number> }
  >();

  if (userAnswersData) {
    for (const answer of userAnswersData) {
      const question = answer.questions as any;
      if (!question || !question.topic_id) continue;

      const topicId = question.topic_id;
      const existing = topicStatsMap.get(topicId) || {
        correctIds: new Set<number>(),
        completedIds: new Set<number>(),
      };

      existing.completedIds.add(question.id);
      if (answer.is_correct) existing.correctIds.add(question.id);
      topicStatsMap.set(topicId, existing);
    }
  }

  // Convert Sets to counts for valid progress objects
  const topicProgressMap = new Map<
    number,
    { correct_count: number; completed_count: number }
  >();

  topicStatsMap.forEach((stats, topicId) => {
    topicProgressMap.set(topicId, {
      correct_count: stats.correctIds.size,
      completed_count: stats.completedIds.size,
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
