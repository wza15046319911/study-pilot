import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { redirect } from "next/navigation";
import { LibraryContent } from "./LibraryContent";

type SubjectStats = {
  weeklyPracticeCount: number;
  questionBankCount: number;
  mockExamCount: number;
};

type AssignedDistributionRow = {
  target_type: "question_bank" | "exam";
  target_id: number;
};

export const metadata = {
  title: "Library | StudyPilot",
  description: "Your complete learning resource library.",
};

export default async function LibraryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profileResult = await supabase
    .from("profiles")
    .select("username, avatar_url, is_vip")
    .eq("id", user.id)
    .single();
  const profile = profileResult.data as {
    username: string | null;
    avatar_url: string | null;
    is_vip: boolean | null;
  } | null;

  const userData = {
    username: profile?.username || user.email?.split("@")[0] || "User",
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: profile?.is_vip || false,
  };

  const subjectsPromise = supabase.from("subjects").select("*").order("id");
  const questionBanksPromise = supabase
    .from("question_banks")
    .select("id, subject_id, visibility")
    .eq("is_published", true);
  const mockExamsPromise = supabase
    .from("exams")
    .select("id, subject_id, visibility")
    .eq("is_published", true);
  const weeklyPracticesPromise = supabase
    .from("weekly_practices")
    .select("subject_id")
    .eq("is_published", true);
  const assignedDistributionPromise = supabase
    .from("distributions")
    .select("target_type, target_id, distribution_users!inner(user_id)")
    .eq("visibility", "assigned_only")
    .eq("distribution_users.user_id", user.id);

  const [
    subjectsResult,
    questionBanksResult,
    mockExamsResult,
    weeklyResult,
    assignedDistributionResult,
  ] =
    await Promise.all([
      subjectsPromise,
      questionBanksPromise,
      mockExamsPromise,
      weeklyPracticesPromise,
      assignedDistributionPromise,
    ]);

  const subjects = subjectsResult.data || [];
  const assignedRows =
    (assignedDistributionResult.data as AssignedDistributionRow[] | null) || [];
  const assignedBankIds = new Set(
    assignedRows
      .filter((row) => row.target_type === "question_bank")
      .map((row) => row.target_id),
  );
  const assignedExamIds = new Set(
    assignedRows
      .filter((row) => row.target_type === "exam")
      .map((row) => row.target_id),
  );

  const questionBankRows =
    ((questionBanksResult.data as
      | { id: number; subject_id: number; visibility: "public" | "assigned_only" | null }[]
      | null) || []).filter(
      (row) =>
        row.visibility !== "assigned_only" || assignedBankIds.has(row.id),
    );
  const mockExamRows =
    ((mockExamsResult.data as
      | { id: number; subject_id: number; visibility: "public" | "assigned_only" | null }[]
      | null) || []).filter(
      (row) =>
        row.visibility !== "assigned_only" || assignedExamIds.has(row.id),
    );
  const weeklyRows =
    (weeklyResult.data as { subject_id: number }[] | null) || [];

  const subjectStatsById: Record<number, SubjectStats> = {};
  const ensureStats = (subjectId: number) => {
    subjectStatsById[subjectId] ??= {
      weeklyPracticeCount: 0,
      questionBankCount: 0,
      mockExamCount: 0,
    };
    return subjectStatsById[subjectId];
  };

  for (const row of questionBankRows) {
    ensureStats(row.subject_id).questionBankCount += 1;
  }

  for (const row of mockExamRows) {
    ensureStats(row.subject_id).mockExamCount += 1;
  }

  for (const row of weeklyRows) {
    ensureStats(row.subject_id).weeklyPracticeCount += 1;
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f8fafc] dark:bg-slate-950 overflow-x-hidden">
      <AmbientBackground />
      <Header user={userData} />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-16 relative z-10">
        <LibraryContent
          subjects={subjects}
          subjectStatsById={subjectStatsById}
        />
      </main>
    </div>
  );
}
