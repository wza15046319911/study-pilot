import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ExamBuilder from "../create/ExamBuilder";
import { decodeId } from "@/lib/ids";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExamPage({ params }: PageProps) {
  const { id } = await params;
  const decodedId = decodeId(id);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const subjectsPromise = supabase
    .from("subjects")
    .select("id, name")
    .order("name");

  const [{ data: examBySlug }, { data: subjects }] = await Promise.all([
    supabase.from("exams").select("*").eq("slug", id).maybeSingle(),
    subjectsPromise,
  ]);

  let exam: any = examBySlug;

  if (!exam && decodedId !== null) {
    const { data: examById } = await supabase
      .from("exams")
      .select("*")
      .eq("id", decodedId)
      .maybeSingle();
    exam = examById;
  }

  if (!exam) {
    notFound();
  }

  const { data: fetchExamQuestions } = await supabase
    .from("exam_questions")
    .select("question_id, order_index")
    .eq("exam_id", exam.id)
    .order("order_index");

  const examQuestions = fetchExamQuestions as any[] | null;

  // Fetch full question objects
  let questions: any[] = [];
  if (examQuestions && examQuestions.length > 0) {
    const questionIds = examQuestions.map((eq) => eq.question_id);
    const { data: fetchQuestionsData } = await supabase
      .from("questions")
      .select("*")
      .in("id", questionIds);

    const questionsData = fetchQuestionsData as any[] | null;

    // Sort questions to match order_index
    if (questionsData) {
      const questionMap = new Map(
        questionsData.map((question) => [question.id, question]),
      );
      questions = examQuestions
        .map((eq) => questionMap.get(eq.question_id))
        .filter(Boolean);
    }
  }

  // Combine data for builder
  const initialData = {
    ...(exam as any),
    questions,
  };

  return <ExamBuilder subjects={subjects || []} initialData={initialData} />;
}
