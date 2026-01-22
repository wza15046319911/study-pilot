import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
// import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { ProfileContent } from "./ProfileContent";
import { getReferralStats } from "@/lib/actions/referral";
import { Profile, Subject, Mistake, Question } from "@/types/database";

// Combined type for progress data calculated from user_answers
interface ProgressWithSubject {
  subjects: Subject;
  total_attempts: number;
  unique_completed: number;
  unique_correct: number;
}

interface MistakeWithQuestion extends Mistake {
  questions: Question;
}

export default async function ProfilePage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  // Fetch user answers with question and subject details for progress calculation
  const { data: userAnswersData } = (await supabase
    .from("user_answers")
    .select(
      `
      is_correct,
      question_id,
      created_at,
      questions!inner (
        subject_id,
        difficulty,
        subjects!inner (
          id,
          name,
          slug,
          category,
          question_count
        )
      )
    `,
    )
    .eq("user_id", user.id)) as {
    data:
      | {
          is_correct: boolean;
          question_id: number;
          created_at: string;
          questions: {
            subject_id: number;
            difficulty: string;
            subjects: any;
          };
        }[]
      | null;
  };

  // Aggregate progress by subject from user_answers
  const progressBySubject = new Map<
    number,
    {
      subject: any;
      totalAttempts: number;
      uniqueCompleted: Set<number>;
      uniqueCorrect: Set<number>;
    }
  >();

  // --- Analytics Aggregation ---

  // 1. Daily Activity (Last 14 Days)
  const dailyActivityMap = new Map<
    string,
    { date: string; count: number; correct: number }
  >();
  const today = new Date();

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

  if (userAnswersData) {
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

      // ... existing Subject Logic ...
      const question = answer.questions as any;
      if (!question || !question.subjects) continue;

      const subjectId = question.subjects.id;
      const existing = progressBySubject.get(subjectId) || {
        subject: question.subjects,
        totalAttempts: 0,
        uniqueCompleted: new Set<number>(),
        uniqueCorrect: new Set<number>(),
      };

      existing.totalAttempts++;
      existing.uniqueCompleted.add(answer.question_id);
      if (answer.is_correct) {
        existing.uniqueCorrect.add(answer.question_id);
      }
      progressBySubject.set(subjectId, existing);
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

  // Convert to array format expected by ProfileContent
  const progress = Array.from(progressBySubject.values()).map((item) => ({
    subjects: item.subject,
    total_attempts: item.totalAttempts,
    unique_completed: item.uniqueCompleted.size,
    unique_correct: item.uniqueCorrect.size,
  }));

  // Fetch mistakes with question details
  const { data: mistakesData } = await supabase
    .from("mistakes")
    .select("*, questions(*)")
    .eq("user_id", user.id)
    .order("last_error_at", { ascending: false })
    .limit(5);

  const mistakes = mistakesData as unknown as MistakeWithQuestion[] | null;

  // Fetch bookmarks with question details
  const { data: bookmarksData } = await supabase
    .from("bookmarks")
    .select("*, questions(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const bookmarks = bookmarksData as unknown as MistakeWithQuestion[] | null;

  // Fetch aggregate stats from user_answers
  const { count: totalQuestionsAnswered } = await supabase
    .from("user_answers")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: correctAnswers } = await supabase
    .from("user_answers")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_correct", true);

  const answerStats = {
    total: totalQuestionsAnswered || 0,
    correct: correctAnswers || 0,
    accuracy:
      totalQuestionsAnswered && totalQuestionsAnswered > 0
        ? Math.round(((correctAnswers || 0) / totalQuestionsAnswered) * 100)
        : 0,
  };

  // Fetch referral stats
  const referralStats = await getReferralStats();

  // Fetch all question banks
  const { data: allBanks } = await supabase
    .from("question_banks")
    .select("*, subjects!inner(*)") // Inner join to ensure subject exists
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // Fetch user unlocked banks
  const { data: unlockedBanksData } = await supabase
    .from("user_bank_unlocks")
    .select("unlocked_bank_id")
    .eq("user_id", user.id);

  const unlockedBankIds = new Set(
    (unlockedBanksData || [])
      .map((u: any) => u.unlocked_bank_id)
      .filter(Boolean) as number[],
  );

  // Determine accessible banks
  // If is_premium === false => Free for everyone
  // If is_premium === true => Need VIP status OR explicit unlock in user_bank_unlocks
  const isVip = profile?.is_vip || false;
  const accessibleBanks = (allBanks || [])
    .filter((bank: any) => {
      const isPremium = bank.is_premium || bank.unlock_type !== "free";

      // Free banks (not premium) are accessible to everyone
      if (!isPremium) return true;

      // Premium banks: only if VIP or explicitly unlocked
      if (isVip) return true;
      if (unlockedBankIds.has(bank.id)) return true;
      return false;
    })
    .map((bank: any) => {
      // Determine if really premium based on flag OR unlock type
      const isPremium = bank.is_premium || bank.unlock_type !== "free";

      let status: "Free" | "Unlocked" | "Premium" = "Free";

      if (isPremium) {
        if (unlockedBankIds.has(bank.id)) {
          status = "Unlocked";
        } else if (isVip) {
          status = "Premium";
        } else {
          // Should be filtered out by previous step, but safe fallback
          status = "Premium";
        }
      }

      return {
        ...bank,
        access_status: status,
      };
    });

  // Fetch user's question bank collections (with fallback if table doesn't exist)
  let userQuestionBanks: any[] = [];
  try {
    const { data: userQuestionBanksData } = await supabase
      .from("user_question_bank_collections")
      .select(
        `
        *,
        question_banks (
          id,
          title,
          slug,
          subjects (*)
        )
      `,
      )
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });
    userQuestionBanks = userQuestionBanksData || [];
  } catch {
    // Table may not exist yet, use empty array
    userQuestionBanks = [];
  }

  // Fetch user's exam collections (with fallback if table doesn't exist)
  let userExams: any[] = [];
  try {
    const { data: userExamsData } = await supabase
      .from("user_exam_collections")
      .select(
        `
        *,
        exams (
          id,
          title,
          slug,
          duration_minutes,
          subjects (*)
        )
      `,
      )
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });
    userExams = userExamsData || [];
  } catch {
    // Table may not exist yet, use empty array
    userExams = [];
  }

  // Fallback profile if not found (should be handled by trigger, but just in case)
  // Also merge auth metadata avatar if profile doesn't have one
  const rawProfile = profile || {
    id: user.id,
    username: user.email?.split("@")[0] || "User",
    email: user.email,
    level: 1,
    streak_days: 0,
    avatar_url: null,
    created_at: new Date().toISOString(),
    last_practice_date: null,
    is_vip: false,
    vip_expires_at: null,
    active_session_id: null,
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
    username: userData.username || user.user_metadata?.name || "User",
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
          progress={progress || []}
          mistakes={mistakes || []}
          bookmarks={bookmarks || []}
          answerStats={answerStats}
          dailyActivity={dailyActivity}
          difficultyStats={difficultyStats}
          referralStats={
            referralStats || {
              totalReferrals: 0,
              unusedReferrals: 0,
              unlockedBanks: 0,
            }
          }
          accessibleBanks={accessibleBanks}
          userQuestionBanks={userQuestionBanks}
          userExams={userExams}
          isAdmin={
            !!process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL
          }
        />
      </main>
    </div>
  );
}
