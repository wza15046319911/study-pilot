"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface QuestionUpdate {
  title?: string;
  content?: string;
  answer?: string;
  explanation?: string | null;
  difficulty?: "easy" | "medium" | "hard";
  code_snippet?: string | null;
  tags?: string[] | null;
  options?: { label: string; content: string }[] | null;
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
