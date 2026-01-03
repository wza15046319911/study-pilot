import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ExamBuilder from "../create/ExamBuilder";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExamPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch exam details
  const { data: exam, error } = await supabase
    .from("exams")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !exam) {
    notFound();
  }

  // Fetch associated question IDs
  const { data: fetchExamQuestions } = await supabase
    .from("exam_questions")
    .select("question_id, order_index")
    .eq("exam_id", id)
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
      questions = examQuestions
        .map((eq) => questionsData.find((q) => q.id === eq.question_id))
        .filter(Boolean);
    }
  }

  // Fetch subjects for dropdown
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .order("name");

  // Combine data for builder
  const initialData = {
    ...(exam as any),
    questions,
  };

  return <ExamBuilder subjects={subjects || []} initialData={initialData} />;
}
