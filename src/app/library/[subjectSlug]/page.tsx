import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { redirect } from "next/navigation";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { SubjectContent } from "./SubjectContent";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
  }>;
}

type WeeklyPracticeItem = {
  id: number;
  title: string;
  slug: string | null;
  description: string | null;
  week_start: string | null;
  subject: {
    name: string;
    slug: string | null;
  } | null;
  items?: { count: number }[] | null;
  latestSubmission?: {
    submitted_at: string;
    answered_count: number;
    correct_count: number;
    total_count: number;
  } | null;
};

type ProfileSummary = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_vip: boolean | null;
};

type BankUnlockRow = { bank_id: number };
type ExamUnlockRow = { exam_id: number };

type WeeklySubmissionRow = {
  weekly_practice_id: number;
  submitted_at: string;
  answered_count: number;
  correct_count: number;
  total_count: number;
};

type PastExamRow = {
  id: number;
  year: number;
  semester: number;
  created_at: string | null;
  title: string | null;
  questions?: { count: number }[] | null;
};

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const supabase = await createClient();

  const { data: subjectData } = await supabase
    .from("subjects")
    .select("name")
    .eq("slug", params.subjectSlug)
    .single();

  const subject = subjectData as { name: string } | null;

  return {
    title: subject
      ? `${subject.name} | Library | StudyPilot`
      : "Subject | StudyPilot",
    description: subject
      ? `Practice materials, mock exams, and question banks for ${subject.name}.`
      : "Subject resources.",
  };
}

export default async function SubjectPage(props: PageProps) {
  const t = await getTranslations("librarySubjectPage");
  const params = await props.params;
  const { subjectSlug } = params;
  const supabase = await createClient();

  // 1. Auth Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch Subject
  const { data: subjectResult } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", subjectSlug)
    .single();

  const subject = subjectResult as {
    id: number;
    name: string;
    slug: string;
    icon?: string;
  } | null;

  if (!subject) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <Header user={{ username: t("fallbackUser") }} />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title={t("subjectNotFound.title")}
            description={t("subjectNotFound.description")}
            backLink="/library"
            backText={t("subjectNotFound.back")}
          />
        </div>
      </div>
    );
  }

  const profilePromise = supabase
    .from("profiles")
    .select("id, username, avatar_url, is_vip")
    .eq("id", user.id)
    .single();

  const examsPromise = supabase
    .from("exams")
    .select(
      "id, title, slug, exam_type, duration_minutes, is_premium, unlock_type, price",
    )
    .eq("subject_id", subject.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const banksPromise = supabase
    .from("question_banks")
    .select(
      `
      id,
      title,
      slug,
      description,
      unlock_type,
      is_premium,
      price,
      subject_id,
      items:question_bank_items(count)
    `,
    )
    .eq("subject_id", subject.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const unlocksPromise = supabase
    .from("user_bank_unlocks")
    .select("bank_id")
    .eq("user_id", user.id);

  const examUnlocksPromise = supabase
    .from("user_exam_unlocks")
    .select("exam_id")
    .eq("user_id", user.id);

  const questionCountPromise = supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("subject_id", subject.id);

  const examDatesPromise = supabase
    .from("subject_exam_dates")
    .select("id, exam_type, exam_date")
    .eq("subject_id", subject.id);

  const weeklyPracticesPromise = supabase
    .from("weekly_practices")
    .select(
      `
      id,
      title,
      slug,
      description,
      week_start,
      subject:subjects (
        name,
        slug
      ),
      items:weekly_practice_items(count)
    `,
    )
    .eq("is_published", true)
    .eq("subject_id", subject.id)
    .order("week_start", { ascending: false });

  const pastExamsPromise = supabase
    .from("past_exams")
    .select(
      `
      id,
      year,
      semester,
      created_at,
      title,
      questions:past_exam_questions(count)
    `,
    )
    .eq("subject_id", subject.id)
    .eq("is_published", true)
    .order("year", { ascending: false })
    .order("semester", { ascending: false })
    .order("created_at", { ascending: false });

  const [
    profileResult,
    examsResult,
    banksResult,
    unlocksResult,
    examUnlocksResult,
    questionCountResult,
    examDatesResult,
    weeklyPracticesResult,
    pastExamsResult,
  ] = await Promise.all([
    profilePromise,
    examsPromise,
    banksPromise,
    unlocksPromise,
    examUnlocksPromise,
    questionCountPromise,
    examDatesPromise,
    weeklyPracticesPromise,
    pastExamsPromise,
  ]);

  const profile = profileResult.data as ProfileSummary | null;
  const isVip = profile?.is_vip || false;

  const userData = {
    username: profile?.username || user.email?.split("@")[0] || t("fallbackUser"),
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: isVip,
  };

  const unlockedBankIds = new Set(
    ((unlocksResult.data as BankUnlockRow[] | null) || []).map((u) => u.bank_id),
  );
  const unlockedExamIds = new Set(
    ((examUnlocksResult.data as ExamUnlockRow[] | null) || []).map((u) => u.exam_id),
  );

  const exams = examsResult.data || [];
  const banks = banksResult.data || [];
  const questionCount = questionCountResult.count || 0;
  const examDates = examDatesResult.data || [];

  const weeklyPractices =
    (weeklyPracticesResult.data as WeeklyPracticeItem[]) || [];

  const weeklyPracticeIds = weeklyPractices
    .map((practice) => practice.id)
    .filter(Boolean);

  const { data: submissions } = weeklyPracticeIds.length
    ? await supabase
        .from("weekly_practice_submissions")
        .select(
          "weekly_practice_id, submitted_at, answered_count, correct_count, total_count",
        )
        .eq("user_id", user.id)
        .in("weekly_practice_id", weeklyPracticeIds)
        .order("submitted_at", { ascending: false })
    : { data: [] as WeeklySubmissionRow[] };

  const latestSubmissionMap = new Map<number, WeeklySubmissionRow>();
  (((submissions as WeeklySubmissionRow[] | null) || [])).forEach((submission) => {
    if (!latestSubmissionMap.has(submission.weekly_practice_id)) {
      latestSubmissionMap.set(submission.weekly_practice_id, submission);
    }
  });

  const weeklyPracticesWithProgress = weeklyPractices.map((practice) => ({
    ...practice,
    latestSubmission: latestSubmissionMap.get(practice.id) || null,
  }));

  const pastExams = ((pastExamsResult.data as PastExamRow[] | null) || []).map((exam) => ({
    id: exam.id,
    year: exam.year,
    semester: exam.semester,
    createdAt: exam.created_at ?? undefined,
    title: exam.title,
    questionCount: exam.questions?.[0]?.count || 0,
  }));

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f0f4fc] dark:bg-slate-900 overflow-x-hidden">
      <AmbientBackground />
      <Header user={userData} />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
          <Link
            href="/library"
            className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <Home className="size-4" />
            {t("breadcrumb.library")}
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-slate-900 dark:text-white font-medium flex items-center gap-2">
            {subject.icon && <span>{subject.icon}</span>}
            {subject.name}
          </span>
        </nav>

        <SubjectContent
          subject={subject}
          exams={exams}
          banks={banks}
          isVip={isVip}
          unlockedBankIds={unlockedBankIds}
          unlockedExamIds={unlockedExamIds}
          questionCount={questionCount}
          examDates={examDates}
          weeklyPractices={weeklyPracticesWithProgress}
          pastExams={pastExams}
        />
      </main>
    </div>
  );
}
