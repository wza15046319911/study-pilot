import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { PastExamAnswerContent } from "../PastExamAnswerContent";
import { decodeId } from "@/lib/ids";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
    year: string;
    semester: string;
    paperId: string;
  }>;
}

type PastExamQuestion = {
  id: number;
  order_index: number;
  question_type: string;
  content: string | null;
  answer: string;
  explanation: string | null;
};

export default async function PastExamPaperPage({ params }: PageProps) {
  const t = await getTranslations("libraryErrors");
  const { subjectSlug, year, semester, paperId } = await params;
  const parsedYear = parseInt(year, 10);
  const parsedSemester = parseInt(semester, 10);
  const decodedPaperId = decodeId(paperId);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?next=/library/${subjectSlug}/past-exams/${year}/${semester}/${paperId}`,
    );
  }

  if (!parsedYear || ![1, 2].includes(parsedSemester) || decodedPaperId === null) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <Header user={{ username: t("fallbackUser") }} />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title={t("pastExamNotFound.title")}
            description={t("pastExamNotFound.description")}
            backLink={`/library/${subjectSlug}`}
            backText={t("pastExamNotFound.backToSubject")}
          />
        </div>
      </div>
    );
  }

  const subjectResult = await supabase
    .from("subjects")
    .select("id, name, slug, icon")
    .eq("slug", subjectSlug)
    .single();
  const subject = subjectResult.data as {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
  } | null;

  const subjectId = subject?.id;

  if (!subject || typeof subjectId !== "number") {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <Header user={{ username: t("fallbackUser") }} />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title={t("subjectNotFound.title")}
            description={t("subjectNotFound.description")}
            backLink="/library"
            backText={t("subjectNotFound.backToLibrary")}
          />
        </div>
      </div>
    );
  }

  const pastExamResult = await supabase
    .from("past_exams")
    .select("id, year, semester, title, is_published")
    .eq("id", decodedPaperId)
    .eq("subject_id", subjectId)
    .eq("year", parsedYear)
    .eq("semester", parsedSemester)
    .eq("is_published", true)
    .maybeSingle();
  const pastExam = pastExamResult.data as {
    id: number;
    year: number;
    semester: number;
    title: string | null;
    is_published: boolean;
  } | null;

  if (!pastExam) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <Header user={{ username: t("fallbackUser") }} />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title={t("pastExamNotFound.title")}
            description={t("pastExamNotFound.description")}
            backLink={`/library/${subjectSlug}`}
            backText={t("pastExamNotFound.backToSubject")}
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

  const questionList = (questions as PastExamQuestion[] | null) || [];
  const typeCounts = questionList.reduce(
    (acc: Record<string, number>, q) => {
      acc[q.question_type] = (acc[q.question_type] || 0) + 1;
      return acc;
    },
    {},
  );

  const typeCountList = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const profileResult = await supabase
    .from("profiles")
    .select("id, username, avatar_url, is_vip")
    .eq("id", user.id)
    .single();
  const profile = profileResult.data as {
    id: string;
    username: string | null;
    avatar_url: string | null;
    is_vip: boolean;
  } | null;

  const userData = {
    username: profile?.username || user.email?.split("@")[0] || t("fallbackUser"),
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
