"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  unlockType: "free" | "premium" | "referral" | "paid";
  price?: number | null;
  allowedModes?: string[];
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

  // Map unlock_type to is_premium for backwards compatibility
  const isPremium = input.unlockType === "premium";

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
      unlock_type: input.unlockType,
      is_premium: isPremium,
      price: input.unlockType === "paid" ? input.price : null,
      allowed_modes: input.allowedModes || ["exam"],
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

  const { data: subject } = await supabase
    .from("subjects")
    .select("slug")
    .eq("id", input.subjectId)
    .single();

  revalidatePath("/admin/exams");
  revalidatePath("/library");
  const subjectData = subject as { slug: string } | null;
  if (subjectData?.slug) {
    revalidatePath(`/library/${subjectData.slug}`);
  }

  return { success: true, examId: examData.id };
}

interface UpdateExamInput extends CreateExamInput {
  examId: number;
}

export async function updateExam(input: UpdateExamInput) {
  const userSupabase = await createClient();
  const {
    data: { user },
  } = await userSupabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  if (
    !input.examId ||
    !input.subjectId ||
    !input.title.trim() ||
    input.questionIds.length === 0
  ) {
    throw new Error("Invalid input");
  }

  const supabase = createAdminClient();

  // Map unlock_type to is_premium for backwards compatibility
  const isPremium = input.unlockType === "premium";

  const { data: existingExam } = await supabase
    .from("exams")
    .select("subject_id")
    .eq("id", input.examId)
    .single();

  const existingExamData = existingExam as { subject_id: number } | null;

  // Update exam details
  const { error: examError } = await (supabase.from("exams") as any)
    .update({
      subject_id: input.subjectId,
      title: input.title.trim(),
      slug: input.slug,
      exam_type: input.examType,
      duration_minutes: input.durationMinutes,
      rules: input.rules,
      is_published: input.publish,
      unlock_type: input.unlockType,
      is_premium: isPremium,
      price: input.unlockType === "paid" ? input.price : null,
      allowed_modes: input.allowedModes || ["exam"],
    })
    .eq("id", input.examId);

  if (examError) {
    throw new Error(examError.message || "Failed to update exam");
  }

  // Delete existing questions
  const { error: deleteError } = await supabase
    .from("exam_questions")
    .delete()
    .eq("exam_id", input.examId);

  if (deleteError) {
    throw new Error("Failed to clear existing questions");
  }

  // Insert new questions
  const examQuestions = input.questionIds.map((questionId, index) => ({
    exam_id: input.examId,
    question_id: questionId,
    order_index: index,
  }));

  const { error: questionsError } = await supabase
    .from("exam_questions")
    .insert(examQuestions as any);

  if (questionsError) {
    throw new Error(questionsError.message);
  }

  const [previousSubjectResult, currentSubjectResult] = await Promise.all([
    existingExamData?.subject_id
      ? supabase
          .from("subjects")
          .select("slug")
          .eq("id", existingExamData.subject_id)
          .single()
      : Promise.resolve({ data: null }),
    supabase
      .from("subjects")
      .select("slug")
      .eq("id", input.subjectId)
      .single(),
  ]);

  revalidatePath("/admin/exams");
  revalidatePath("/library");
  const previousSlug = (previousSubjectResult?.data as { slug: string } | null)?.slug;
  const currentSlug = (currentSubjectResult?.data as { slug: string } | null)?.slug;
  if (previousSlug) {
    revalidatePath(`/library/${previousSlug}`);
  }
  if (currentSlug && currentSlug !== previousSlug) {
    revalidatePath(`/library/${currentSlug}`);
  }

  return { success: true };
}
