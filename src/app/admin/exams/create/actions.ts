"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";

type ExamType = "midterm" | "final";

interface CreateExamInput {
  subjectId: number;
  title: string;
  slug: string;
  examType: ExamType;
  durationMinutes: number;
  rules: Record<string, number>;
  publish: boolean;
  questionIds: number[];
}

export async function createExam(input: CreateExamInput) {
  const userSupabase = await createClient();
  const {
    data: { user },
  } = await userSupabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  if (
    !input.subjectId ||
    !input.title.trim() ||
    input.questionIds.length === 0
  ) {
    throw new Error("Invalid input");
  }

  const supabase = createAdminClient();

  const { data: exam, error: examError } = await supabase
    .from("exams")
    .insert({
      subject_id: input.subjectId,
      title: input.title.trim(),
      slug: input.slug,
      exam_type: input.examType,
      duration_minutes: input.durationMinutes,
      rules: input.rules,
      is_published: input.publish,
    } as any)
    .select()
    .single();

  if (examError || !exam) {
    throw new Error(examError?.message || "Failed to create exam");
  }

  const examData = exam as any;

  const examQuestions = input.questionIds.map((questionId, index) => ({
    exam_id: examData.id,
    question_id: questionId,
    order_index: index,
  }));

  const { error: questionsError } = await supabase
    .from("exam_questions")
    .insert(examQuestions as any);

  if (questionsError) {
    throw new Error(questionsError.message);
  }

  return { success: true, examId: examData.id };
}
