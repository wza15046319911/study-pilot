import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { ProfileContent } from "./ProfileContent";
import { getReferralStats } from "@/lib/actions/referral";
import {
  Profile,
  UserProgress,
  Subject,
  Mistake,
  Question,
} from "@/types/database";

// Combined type for progress join query
// Note: Supabase types are raw table rows, not joined result.
// We need to define the shape of the join result.
interface UserProgressWithSubject extends UserProgress {
  subjects: Subject;
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

  // Fetch user progress with subject details
  // Note: Type assertion needed for joined data
  const { data: progressData } = await supabase
    .from("user_progress")
    .select("*, subjects(*)")
    .eq("user_id", user.id);

  // Cast to correct type (handling the joined relationship being an object or array depending on relationship)
  // Usually singular relation -> object
  const progress = progressData as unknown as UserProgressWithSubject[] | null;

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

  const bookmarks = bookmarksData as unknown as MistakeWithQuestion[] | null; // Using same type for simplicity as structure is similar enough for now or I can define proper type

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
      <AmbientBackground />
      <Header user={headerUser} />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileContent
          user={userData}
          progress={progress || []}
          mistakes={mistakes || []}
          bookmarks={bookmarks || []}
          answerStats={answerStats}
          referralStats={
            referralStats || {
              totalReferrals: 0,
              unusedReferrals: 0,
              unlockedBanks: 0,
            }
          }
        />
      </main>
    </div>
  );
}
