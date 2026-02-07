import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { Header } from "@/components/layout/Header";
import { ExamPreviewContent } from "./ExamPreviewContent";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
    examSlug: string;
  }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const fallbackTitle = params.examSlug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    title: fallbackTitle
      ? `${fallbackTitle} | Mock Exam | StudyPilot`
      : "Mock Exam | StudyPilot",
    description: fallbackTitle
      ? `Practice with ${fallbackTitle} mock exam.`
      : "Mock exam simulation.",
  };
}

export default async function LibraryExamPreviewPage(props: PageProps) {
  const params = await props.params;
  const { subjectSlug, examSlug } = params;
  const supabase = await createClient();

  // Check Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/library/${subjectSlug}/exams/${examSlug}`);
  }

  // Fetch Subject
  const { data: subjectData } = await supabase
    .from("subjects")
    .select("id, slug, name, icon")
    .eq("slug", subjectSlug)
    .single();

  const subject = subjectData as {
    id: number;
    slug: string;
    name: string;
    icon?: string;
  } | null;

  if (!subject) {
    redirect("/library");
  }

  // Fetch Exam
  const { data: exam, error: examError } = await (supabase.from("exams") as any)
    .select(
      [
        "id",
        "slug",
        "title",
        "subject_id",
        "exam_type",
        "duration_minutes",
        "unlock_type",
        "is_premium",
        "price",
      ].join(", "),
    )
    .eq("slug", examSlug)
    .eq("subject_id", subject.id)
    .maybeSingle();

  if (!exam || examError) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <Header user={{ username: "User" }} />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="Exam Not Found"
            description="The exam you are trying to access does not exist."
            backLink={`/library/${subjectSlug}`}
            backText="Back to Subject"
          />
        </div>
      </div>
    );
  }

  // Fetch User Profile
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("id, username, avatar_url, is_vip")
    .eq("id", user.id)
    .single();

  const userData = {
    username: profile?.username || user.email?.split("@")[0] || "User",
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: profile?.is_vip || false,
  };

  let isUnlocked = false;

  if (exam.unlock_type === "free") {
    isUnlocked = true;
  } else if (exam.unlock_type === "premium" && profile?.is_vip) {
    isUnlocked = true;
  } else {
    const { data: unlock } = await (supabase.from("user_exam_unlocks") as any)
      .select("id")
      .eq("user_id", user.id)
      .eq("exam_id", exam.id)
      .maybeSingle();

    if (unlock) {
      isUnlocked = true;
    }
  }

  // Fetch Exam Questions with Details for Stats
  const { data: examQuestions } = await supabase
    .from("exam_questions")
    .select(
      `
      question:questions(
        difficulty,
        topic:topics(name)
      )
    `
    )
    .eq("exam_id", exam.id);

  const questions = (examQuestions || []).map((eq: any) => eq.question);
  const totalQuestions = questions.length;

  // Calculate Stats
  const difficultyCounts = questions.reduce(
    (acc: any, q: any) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 }
  );

  const topicCounts = questions.reduce((acc: any, q: any) => {
    const topicValue = Array.isArray(q.topic) ? q.topic[0] : q.topic;
    const topicName = topicValue?.name || "General";
    acc[topicName] = (acc[topicName] || 0) + 1;
    return acc;
  }, {});

  const sortedTopics = Object.entries(topicCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  return (
    <ExamPreviewContent
      exam={exam}
      user={userData}
      difficultyCounts={difficultyCounts}
      sortedTopics={sortedTopics as any}
      totalQuestions={totalQuestions}
      isUnlocked={isUnlocked}
      libraryContext={{
        subjectSlug,
        subjectName: subject.name,
        subjectIcon: subject.icon,
      }}
    />
  );
}
