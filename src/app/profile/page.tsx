import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
// import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { ProfileContent } from "./ProfileContent";
import { getReferralStats } from "@/lib/actions/referral";
import { Profile, Subject, Mistake, Question } from "@/types/database";
import { getTranslations } from "next-intl/server";

type QuestionSummary = Pick<Question, "title" | "difficulty">;

interface MistakeWithQuestion extends Mistake {
  questions: QuestionSummary;
}

interface BookmarkWithQuestion {
  id: number;
  question_id: number;
  created_at: string;
  questions: QuestionSummary;
}

interface HomeworkAssignmentWithDetails {
  id: number;
  completed_at: string | null;
  homeworks: {
    id: number;
    title: string;
    due_at: string | null;
  } | null;
}

interface HomeworkPreviewItem {
  id: number;
  title: string;
  dueAt: string | null;
  completedAt: string | null;
}

interface AccessibleBank {
  id: number;
  title: string;
  slug: string | null;
  subjects: Subject;
  is_premium: boolean;
  unlock_type: "free" | "premium" | "referral" | "paid";
  access_status: "Free" | "Unlocked" | "Premium";
}

export default async function ProfilePage() {
  const t = await getTranslations("profilePageMeta");
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const today = new Date();
  const activityStart = new Date(today);
  activityStart.setDate(today.getDate() - 29);
  const activityStartIso = activityStart.toISOString();

  const profilePromise = supabase
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

  const userAnswersPromise = supabase
    .from("user_answers")
    .select(
      `
      is_correct,
      created_at,
      questions!inner (
        difficulty
      )
    `,
    )
    .eq("user_id", user.id)
    .gte("created_at", activityStartIso);

  const mistakesPromise = supabase
    .from("mistakes")
    .select(
      "id, question_id, error_count, last_error_at, questions(title, difficulty)",
    )
    .eq("user_id", user.id)
    .order("last_error_at", { ascending: false })
    .limit(5);

  const bookmarksPromise = supabase
    .from("bookmarks")
    .select("id, question_id, created_at, questions(title, difficulty)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const totalAnswersPromise = supabase
    .from("user_answers")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const correctAnswersPromise = supabase
    .from("user_answers")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_correct", true);

  const referralStatsPromise = getReferralStats(user.id);

  const userProgressPromise = supabase
    .from("user_progress")
    .select(
      `
      completed_count,
      correct_count,
      subjects!inner (
        id,
        name,
        slug,
        category,
        question_count
      )
    `,
    )
    .eq("user_id", user.id);

  const userQuestionBanksPromise = supabase
    .from("user_question_bank_collections")
    .select(
      `
      id,
      bank_id,
      added_at,
      completion_count,
      last_completed_at,
        question_banks (
          id,
          title,
          slug,
          subjects (
            id,
            name,
            slug
          )
        )
    `,
    )
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  // Fetch homework assignments to calculate stats
  const homeworkAssignmentsPromise = supabase
    .from("homework_assignments")
    .select(
      `
      id,
      completed_at,
      homeworks (
        id,
        title,
        due_at
      )
    `,
    )
    .eq("user_id", user.id);

  const userExamsPromise = supabase
    .from("user_exam_collections")
    .select(
      `
      id,
      exam_id,
      added_at,
      completion_count,
      best_score,
      best_time_seconds,
      last_attempted_at,
      exams (
        id,
        subject_id,
        title,
        slug,
        subjects (
          id,
          name,
          slug
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  const [
    profileResult,
    userAnswersResult,
    mistakesResult,
    bookmarksResult,
    totalAnswersResult,
    correctAnswersResult,
    referralStatsResult,
    userProgressResult,
    userQuestionBanksResult,
    homeworkAssignmentsResult,
    userExamsResult,
  ] = await Promise.all([
    profilePromise,
    userAnswersPromise,
    mistakesPromise,
    bookmarksPromise,
    totalAnswersPromise,
    correctAnswersPromise,
    referralStatsPromise,
    userProgressPromise,
    userQuestionBanksPromise,
    homeworkAssignmentsPromise,
    userExamsPromise,
  ]);

  const referralStats = referralStatsResult || {
    totalReferrals: 0,
    unusedReferrals: 0,
    unlockedBanks: 0,
  };

  const profile = profileResult.data as Profile | null;

  const userAnswersData = (userAnswersResult.data || []) as {
    is_correct: boolean;
    created_at: string;
    questions: {
      difficulty: string | null;
    };
  }[];

  const mistakes = (mistakesResult.data || []) as MistakeWithQuestion[];
  const bookmarks = (bookmarksResult.data || []) as BookmarkWithQuestion[];

  const totalQuestionsAnswered = totalAnswersResult.count || 0;
  const correctAnswers = correctAnswersResult.count || 0;

  const userProgressData = (userProgressResult.data || []) as Array<{
    completed_count: number;
    correct_count: number;
    subjects: Subject;
  }>;

  const userQuestionBanks = userQuestionBanksResult.error
    ? []
    : userQuestionBanksResult.data || [];
  const userExams = userExamsResult.error ? [] : userExamsResult.data || [];

  const homeworkAssignments = (homeworkAssignmentsResult.data ||
    []) as HomeworkAssignmentWithDetails[];

  // Calculate homework stats
  const homeworkStats = {
    assigned: homeworkAssignments.length,
    graded: homeworkAssignments.filter((h) => h.completed_at).length,
    due: homeworkAssignments.filter((h) => !h.completed_at).length,
  };

  const homeworkPreview: HomeworkPreviewItem[] = homeworkAssignments
    .flatMap((assignment) => {
      if (!assignment.homeworks) return [];

      return [
        {
          id: assignment.homeworks.id,
          title: assignment.homeworks.title,
          dueAt: assignment.homeworks.due_at,
          completedAt: assignment.completed_at,
        },
      ];
    })
    .sort((a, b) => {
      if (!!a.completedAt !== !!b.completedAt) {
        return a.completedAt ? 1 : -1;
      }

      if (a.dueAt && b.dueAt) {
        return (
          new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
        );
      }

      if (a.dueAt) return -1;
      if (b.dueAt) return 1;
      return 0;
    })
    .slice(0, 3);

  // --- Analytics Aggregation ---

  // 1. Daily Activity (Last 30 Days)
  const dailyActivityMap = new Map<
    string,
    { date: string; count: number; correct: number }
  >();

  // Initialize last 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
    dailyActivityMap.set(dateStr, {
      date: new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
      }).format(new Date(dateStr)),
      count: 0,
      correct: 0,
    });
  }

  // 2. Difficulty Stats
  const difficultyStatsMap = new Map<
    string,
    { total: number; correct: number }
  >();
  ["easy", "medium", "hard"].forEach((level) => {
    difficultyStatsMap.set(level, { total: 0, correct: 0 });
  });

  if (userAnswersData.length > 0) {
    for (const answer of userAnswersData) {
      // Daily Activity processing
      const dateStr = new Date(answer.created_at).toISOString().split("T")[0];
      if (dailyActivityMap.has(dateStr)) {
        const dayStat = dailyActivityMap.get(dateStr)!;
        dayStat.count++;
        if (answer.is_correct) dayStat.correct++;
        // map updates by reference, but set just in case
      }

      // Difficulty processing
      const difficulty = answer.questions.difficulty?.toLowerCase() || "medium";
      // Normalize difficulty levels if needed (e.g. if db has 'Medium' or 'Normal')
      let normalizedDifficulty = "medium";
      if (difficulty.includes("easy")) normalizedDifficulty = "easy";
      if (difficulty.includes("hard")) normalizedDifficulty = "hard";

      const diffStat = difficultyStatsMap.get(normalizedDifficulty) || {
        total: 0,
        correct: 0,
      };
      diffStat.total++;
      if (answer.is_correct) diffStat.correct++;
      difficultyStatsMap.set(normalizedDifficulty, diffStat); // Update map if it was a new entry
    }
  }

  const dailyActivity = Array.from(dailyActivityMap.values());

  const difficultyStats = Array.from(difficultyStatsMap.entries()).map(
    ([level, stats]) => ({
      level: level.charAt(0).toUpperCase() + level.slice(1),
      total: stats.total,
      correct: stats.correct,
      accuracy:
        stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }),
  );

  const progress = userProgressData.map((item) => ({
    subjects: item.subjects,
    total_attempts: item.completed_count || 0,
    unique_completed: item.completed_count || 0,
    unique_correct: item.correct_count || 0,
  }));

  const answerStats = {
    total: totalQuestionsAnswered,
    correct: correctAnswers,
    accuracy:
      totalQuestionsAnswered > 0
        ? Math.round((correctAnswers / totalQuestionsAnswered) * 100)
        : 0,
  };

  const accessibleBanks: AccessibleBank[] = [];

  // Fallback profile if not found (should be handled by trigger, but just in case)
  // Also merge auth metadata avatar if profile doesn't have one
  const rawProfile = profile || {
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
  };

  const userData = {
    ...rawProfile,
    avatar_url:
      rawProfile.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null,
  };

  // Header requires avatar_url to be string | undefined, not null
  const headerUser = {
    username: userData.username || user.user_metadata?.name || t("fallbackUser"),
    avatar_url:
      userData.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      undefined,
    is_vip: userData.is_vip,
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* <AmbientBackground /> */}
      <Header user={headerUser} />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileContent
          user={userData}
          progress={progress}
          mistakes={mistakes || []}
          bookmarks={bookmarks || []}
          answerStats={answerStats}
          dailyActivity={dailyActivity}
          difficultyStats={difficultyStats}
          referralStats={referralStats}
          accessibleBanks={accessibleBanks}
          userQuestionBanks={userQuestionBanks}
          userExams={userExams}
          homeworkStats={homeworkStats}
          homeworkPreview={homeworkPreview}
          isAdmin={userData.is_admin || false}
        />
      </main>
    </div>
  );
}
