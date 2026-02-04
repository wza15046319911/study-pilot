import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { PastExamAnswerContent } from "./PastExamAnswerContent";

interface PageProps {
  params: Promise<{ subjectSlug: string; year: string; semester: string }>;
}

export default async function PastExamAnswerPage({ params }: PageProps) {
  const { subjectSlug, year, semester } = await params;
  const parsedYear = parseInt(year, 10);
  const parsedSemester = parseInt(semester, 10);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?next=/library/${subjectSlug}/past-exams/${year}/${semester}`,
    );
  }

  if (!parsedYear || ![1, 2].includes(parsedSemester)) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <Header user={{ username: "User" }} />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="Past Exam Not Found"
            description="The past exam you are looking for does not exist."
            backLink={`/library/${subjectSlug}`}
            backText="Back to Subject"
          />
        </div>
      </div>
    );
  }

  const { data: subject } = await supabase
    .from("subjects")
    .select("id, name, slug, icon")
    .eq("slug", subjectSlug)
    .single();

  if (!subject) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <Header user={{ username: "User" }} />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="Subject Not Found"
            description="The subject you're looking for doesn't exist."
            backLink="/library"
            backText="Back to Library"
          />
        </div>
      </div>
    );
  }

  const { data: pastExam } = await (supabase.from("past_exams") as any)
    .select("id, year, semester, title, is_published")
    .eq("subject_id", (subject as any).id)
    .eq("year", parsedYear)
    .eq("semester", parsedSemester)
    .eq("is_published", true)
    .maybeSingle();

  if (!pastExam) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <Header user={{ username: "User" }} />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="Past Exam Not Found"
            description="The past exam you are looking for does not exist."
            backLink={`/library/${subjectSlug}`}
            backText="Back to Subject"
          />
        </div>
      </div>
    );
  }

  const { data: questions } = await supabase
    .from("past_exam_questions")
    .select("id, order_index, question_type, content, answer, explanation")
    .eq("past_exam_id", pastExam.id)
    .order("order_index", { ascending: true });

  const questionList = questions || [];
  const typeCounts = questionList.reduce(
    (acc: Record<string, number>, q: any) => {
      acc[q.question_type] = (acc[q.question_type] || 0) + 1;
      return acc;
    },
    {},
  );

  const typeCountList = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const { data: profile } = await (supabase.from("profiles") as any)
    .select("id, username, avatar_url, is_vip")
    .eq("id", user.id)
    .single();

  const userData = {
    username: profile?.username || user.email?.split("@")[0] || "User",
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: profile?.is_vip || false,
  };

  return (
    <PastExamAnswerContent
      user={userData}
      subject={subject}
      exam={pastExam}
      questions={questionList}
      typeCounts={typeCountList}
    />
  );
}
