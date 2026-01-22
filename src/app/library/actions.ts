"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleQuestionBankCollection(bankId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Check if exists
  const { data: existing } = await supabase
    .from("user_question_bank_collections")
    .select("id")
    .eq("user_id", user.id)
    .eq("bank_id", bankId)
    .maybeSingle();

  if (existing) {
    // Remove
    const { error } = await supabase
      .from("user_question_bank_collections")
      .delete()
      .eq("user_id", user.id)
      .eq("bank_id", bankId);

    if (error) return { success: false, error: error.message };
  } else {
    // Add
    const { error } = await (
      supabase.from("user_question_bank_collections") as any
    ).insert({
      user_id: user.id,
      bank_id: bankId,
    });

    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/question-banks");
  revalidatePath("/library");
  return { success: true, isCollected: !existing };
}

export async function toggleExamCollection(examId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Check if exists
  const { data: existing } = await supabase
    .from("user_exam_collections")
    .select("id")
    .eq("user_id", user.id)
    .eq("exam_id", examId)
    .maybeSingle();

  if (existing) {
    // Remove
    const { error } = await supabase
      .from("user_exam_collections")
      .delete()
      .eq("user_id", user.id)
      .eq("exam_id", examId);

    if (error) return { success: false, error: error.message };
  } else {
    // Add
    const { error } = await (
      supabase.from("user_exam_collections") as any
    ).insert({
      user_id: user.id,
      exam_id: examId,
    });

    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/exams");
  revalidatePath("/library");
  return { success: true, isCollected: !existing };
}
