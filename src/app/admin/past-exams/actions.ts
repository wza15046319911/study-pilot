"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { encodeId } from "@/lib/ids";

interface UpsertPastExamInput {
  pastExamId?: number;
  subjectId: number;
  year: number;
  semester: number;
  title?: string | null;
  isPublished: boolean;
}

interface ReplaceQuestionsInput {
  pastExamId: number;
  questions: {
    question_type: string;
    content?: string | null;
    answer: string;
    explanation?: string | null;
  }[];
}

const requireAdmin = async () => {
  const userSupabase = await createClient();
  const {
    data: { user },
  } = await userSupabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  return user;
};

export async function upsertPastExam(input: UpsertPastExamInput) {
  await requireAdmin();

  if (!input.subjectId || !input.year || !input.semester) {
    throw new Error("Invalid input");
  }

  const supabase = createAdminClient();

  const payload = {
    subject_id: input.subjectId,
    year: input.year,
    semester: input.semester,
    title: input.title || null,
    is_published: input.isPublished,
    updated_at: new Date().toISOString(),
  };

  let pastExamId = input.pastExamId;
  let previousSubjectId: number | null = null;

  if (pastExamId) {
    const { data: existing } = await supabase
      .from("past_exams")
      .select("subject_id")
      .eq("id", pastExamId)
      .single();

    previousSubjectId =
      (existing as { subject_id: number } | null)?.subject_id ?? null;

    const { error } = await (supabase.from("past_exams") as any)
      .update(payload)
      .eq("id", pastExamId);

    if (error) {
      throw new Error(error.message || "Failed to update past exam");
    }
  } else {
    const { data, error } = await (supabase.from("past_exams") as any)
      .insert(payload)
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to create past exam");
    }

    pastExamId = (data as { id: number }).id;
  }

  const [previousSubjectResult, currentSubjectResult] = await Promise.all([
    previousSubjectId
      ? supabase
          .from("subjects")
          .select("slug")
          .eq("id", previousSubjectId)
          .single()
      : Promise.resolve({ data: null }),
    supabase.from("subjects").select("slug").eq("id", input.subjectId).single(),
  ]);

  revalidatePath("/admin/past-exams");
  revalidatePath("/library");

  const previousSlug = (previousSubjectResult?.data as { slug: string } | null)
    ?.slug;
  const currentSlug = (currentSubjectResult?.data as { slug: string } | null)
    ?.slug;

  if (previousSlug) {
    revalidatePath(`/library/${previousSlug}`);
  }
  if (currentSlug) {
    revalidatePath(`/library/${currentSlug}`);
    revalidatePath(
      `/library/${currentSlug}/past-exams/${input.year}/${input.semester}`,
    );
    if (pastExamId) {
      revalidatePath(
        `/library/${currentSlug}/past-exams/${input.year}/${input.semester}/${encodeId(pastExamId)}`,
      );
    }
  }

  if (!pastExamId) {
    throw new Error("Failed to resolve past exam id");
  }

  return { success: true, pastExamId };
}

export async function replacePastExamQuestions(input: ReplaceQuestionsInput) {
  await requireAdmin();

  if (!input.pastExamId) {
    throw new Error("Invalid past exam id");
  }

  const supabase = createAdminClient();

  const { error: deleteError } = await supabase
    .from("past_exam_questions")
    .delete()
    .eq("past_exam_id", input.pastExamId);

  if (deleteError) {
    throw new Error("Failed to clear old questions: " + deleteError.message);
  }

  if (input.questions.length > 0) {
    const rows = input.questions.map((question, index) => ({
      past_exam_id: input.pastExamId,
      order_index: index,
      question_type: question.question_type,
      content: question.content || null,
      answer: question.answer,
      explanation: question.explanation || null,
    }));

    const { error: insertError } = await supabase
      .from("past_exam_questions")
      .insert(rows as any);

    if (insertError) {
      throw new Error("Failed to insert questions: " + insertError.message);
    }
  }

  revalidatePath("/admin/past-exams");
  revalidatePath("/library");

  return { success: true };
}

export async function deletePastExam(pastExamId: number) {
  await requireAdmin();

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("past_exams")
    .delete()
    .eq("id", pastExamId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/past-exams");
  revalidatePath("/library");
  return { success: true };
}
