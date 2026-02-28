"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreateQuestionInput {
  subject_id: number;
  topic_id: number | null;
  title: string;
  content: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  options: { label: string; content: string }[] | null;
  answer: string;
  explanation: string | null;
  code_snippet: string | null;
  test_cases: { function_name: string; test_cases: { input: unknown[]; expected: unknown }[] } | null;
  tags: string[] | null;
}

export async function createQuestion(input: CreateQuestionInput) {
  const userSupabase = await createClient();
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = createAdminClient();

  const payload = {
    subject_id: input.subject_id,
    topic_id: input.topic_id,
    title: input.title,
    content: input.content,
    type: input.type,
    difficulty: input.difficulty,
    options: input.options,
    answer: input.answer,
    explanation: input.explanation,
    code_snippet: input.code_snippet,
    test_cases: input.test_cases,
    tags: input.tags,
  };

  const { error } = await (supabase as any)
    .from("questions")
    .insert(payload);

  if (error) {
    console.error("Create question error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/questions");
  revalidatePath("/admin/create-question");
  return { success: true };
}

export interface BatchUploadQuestionInput {
  subject_id: number;
  topic_id: number | null;
  title: string;
  content: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  options: { label: string; content: string }[] | null;
  answer: string;
  explanation: string | null;
  code_snippet: string | null;
  test_cases: unknown;
  tags: string[] | null;
}

export async function batchUploadQuestions(
  questions: BatchUploadQuestionInput[]
) {
  const userSupabase = await createClient();
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = createAdminClient();

  const payload = questions.map((q) => ({
    subject_id: q.subject_id,
    topic_id: q.topic_id,
    title: q.title,
    content: q.content,
    type: q.type,
    difficulty: q.difficulty,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    code_snippet: q.code_snippet,
    test_cases: q.test_cases,
    tags: q.tags,
  }));

  const { error } = await (supabase as any)
    .from("questions")
    .insert(payload);

  if (error) {
    console.error("Batch upload questions error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/questions");
  revalidatePath("/admin/upload-question");
  return { success: true, count: questions.length };
}

interface QuestionUpdate {
  title?: string;
  content?: string;
  answer?: string;
  explanation?: string | null;
  difficulty?: "easy" | "medium" | "hard";
  code_snippet?: string | null;
  tags?: string[] | null;
  options?: { label: string; content: string }[] | null;
  test_cases?: {
    function_name: string;
    test_cases: { input: unknown[]; expected: unknown }[];
  } | null;
  topic_id?: number | null;
  subject_id?: number;
}

export async function updateQuestion(id: number, data: QuestionUpdate) {
  const userSupabase = await createClient();
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const supabase = createAdminClient();

  const { error, data: result } = await (supabase as any)
    .from("questions")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update question error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/questions");
  return { success: true, data: result };
}

export async function deleteQuestion(id: number) {
  const userSupabase = await createClient();
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("questions").delete().eq("id", id);

  if (error) {
    console.error("Delete question error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/questions");
  return { success: true };
}

export async function batchUpdateQuestions(
  ids: number[],
  data: Partial<QuestionUpdate>
) {
  const userSupabase = await createClient();
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const supabase = createAdminClient();

  const { error } = await (supabase as any)
    .from("questions")
    .update(data)
    .in("id", ids);

  if (error) {
    console.error("Batch update error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/questions");
  return { success: true };
}

export async function batchAddTags(ids: number[], newTags: string[]) {
  const userSupabase = await createClient();
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const supabase = createAdminClient();

  // 1. Fetch current tags for these questions
  const { data: questionsData, error: fetchError } = await supabase
    .from("questions")
    .select("id, tags")
    .in("id", ids);

  if (fetchError || !questionsData) {
    return { success: false, error: fetchError?.message || "Failed to fetch" };
  }

  const questions = questionsData as any[];

  // 2. Update each question individually to append tags (safest way without stored proc)
  // Parallelize the updates
  const updates = questions.map((q) => {
    const existingTags = q.tags || [];
    const mergedTags = Array.from(new Set([...existingTags, ...newTags]));
    return (supabase as any)
      .from("questions")
      .update({ tags: mergedTags })
      .eq("id", q.id);
  });

  await Promise.all(updates);

  revalidatePath("/admin/questions");
  return { success: true };
}

export async function duplicateQuestion(id: number) {
  const userSupabase = await createClient();
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const supabase = createAdminClient();

  // Fetch original question
  const { data: original, error: fetchError } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) {
    return {
      success: false,
      error: fetchError?.message || "Question not found",
    };
  }

  // Create copy - cast to any to allow destructuring
  const originalData = original as any;
  const { id: _id, created_at: _created, ...copyData } = originalData;
  const newQuestion = {
    ...copyData,
    title: `${originalData.title || "Question"} (Copy)`,
  };

  const { data: inserted, error: insertError } = await (supabase as any)
    .from("questions")
    .insert(newQuestion)
    .select()
    .single();

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  revalidatePath("/admin/questions");
  return { success: true, data: inserted };
}

export async function batchDeleteQuestions(ids: number[]) {
  const userSupabase = await createClient();
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("questions").delete().in("id", ids);

  if (error) {
    console.error("Batch delete error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/questions");
  return { success: true, count: ids.length };
}

// --- Usage Tracking ---

export interface QuestionUsage {
  questionBanks: { id: number; title: string; slug: string }[];
  exams: { id: number; title: string; slug: string }[];
  homeworks: { id: number; title: string; slug: string }[];
  weeklyPractices: { id: number; title: string; slug: string }[];
  isOrphan: boolean;
}

export async function getQuestionUsage(questionId: number): Promise<{ success: boolean; data?: QuestionUsage; error?: string }> {
  const userSupabase = await createClient();
  const { data: { user } } = await userSupabase.auth.getUser();
  
  // Basic admin check (optional for reading usage, but consistent with file)
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    // We could allow non-admins to read this if needed, but for now stick to admin-only
    return { success: false, error: "Unauthorized" };
  }

  const supabase = createAdminClient();

  try {
    const [banksRes, examsRes, homeworksRes, weeklyRes] = await Promise.all([
      supabase.from("question_bank_items").select("bank_id, question_banks(id, title, slug)").eq("question_id", questionId),
      supabase.from("exam_questions").select("exam_id, exams(id, title, slug)").eq("question_id", questionId),
      supabase.from("homework_items").select("homework_id, homeworks(id, title, slug)").eq("question_id", questionId),
      supabase.from("weekly_practice_items").select("weekly_practice_id, weekly_practices(id, title, slug)").eq("question_id", questionId),
    ]);

    const questionBanks = (banksRes.data || [])
      .map((item: any) => item.question_banks)
      .filter(Boolean)
      .map((b: any) => ({ id: b.id, title: b.title, slug: b.slug }));

    const exams = (examsRes.data || [])
      .map((item: any) => item.exams)
      .filter(Boolean)
      .map((e: any) => ({ id: e.id, title: e.title, slug: e.slug }));

    const homeworks = (homeworksRes.data || [])
      .map((item: any) => item.homeworks)
      .filter(Boolean)
      .map((h: any) => ({ id: h.id, title: h.title, slug: h.slug }));
    
    const weeklyPractices = (weeklyRes.data || [])
      .map((item: any) => item.weekly_practices)
      .filter(Boolean)
      .map((w: any) => ({ id: w.id, title: w.title, slug: w.slug }));

    const isOrphan = 
      questionBanks.length === 0 && 
      exams.length === 0 && 
      homeworks.length === 0 && 
      weeklyPractices.length === 0;

    return {
      success: true,
      data: {
        questionBanks,
        exams,
        homeworks,
        weeklyPractices,
        isOrphan
      }
    };

  } catch (err: any) {
    console.error("Error fetching question usage:", err);
    return { success: false, error: err.message };
  }
}

export async function batchGetQuestionUsageStatus(questionIds: number[]): Promise<{ success: boolean; data?: Record<number, boolean>; error?: string }> {
  const userSupabase = await createClient();
  const { data: { user } } = await userSupabase.auth.getUser();
  
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = createAdminClient();

  if (questionIds.length === 0) {
    return { success: true, data: {} };
  }

  try {
    // We want to know if a question is USED. 
    // It is used if it appears in any of the 4 tables.
    // It is an orphan if it does NOT appear in ANY of the 4 tables.
    
    // We can fetch all distinct question_ids from the 4 tables that are in our list.
    const [banksRes, examsRes, homeworksRes, weeklyRes] = await Promise.all([
      supabase.from("question_bank_items").select("question_id").in("question_id", questionIds),
      supabase.from("exam_questions").select("question_id").in("question_id", questionIds),
      supabase.from("homework_items").select("question_id").in("question_id", questionIds),
      supabase.from("weekly_practice_items").select("question_id").in("question_id", questionIds),
    ]);

    const usedIds = new Set<number>();
    
    (banksRes.data || []).forEach((item: any) => usedIds.add(item.question_id));
    (examsRes.data || []).forEach((item: any) => usedIds.add(item.question_id));
    (homeworksRes.data || []).forEach((item: any) => usedIds.add(item.question_id));
    (weeklyRes.data || []).forEach((item: any) => usedIds.add(item.question_id));

    // Map each input ID to whether it is an orphan (NOT in usedIds)
    const result: Record<number, boolean> = {};
    questionIds.forEach(id => {
      result[id] = !usedIds.has(id);
    });

    return { success: true, data: result };

  } catch (err: any) {
    console.error("Error fetching usage status:", err);
    return { success: false, error: err.message };
  }
}
