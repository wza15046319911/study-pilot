"use server";

import { createClient } from "@/lib/supabase/server";

export type ActionResult = { success: true } | { success: false; error: string };

export async function setBookmark(
  questionId: number,
  shouldBookmark: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();
  const db = supabase as any;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  if (!Number.isInteger(questionId) || questionId <= 0) {
    return { success: false, error: "Invalid question id" };
  }

  if (shouldBookmark) {
    const { error } = await db.from("bookmarks").insert({
      user_id: user.id,
      question_id: questionId,
    });

    if (error && error.code !== "23505") {
      console.error("[practice-action] setBookmark(insert) failed:", {
        questionId,
        userId: user.id,
        error,
      });
      return { success: false, error: error.message || "Failed to bookmark" };
    }
  } else {
    const { error } = await db
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("question_id", questionId);

    if (error) {
      console.error("[practice-action] setBookmark(delete) failed:", {
        questionId,
        userId: user.id,
        error,
      });
      return { success: false, error: error.message || "Failed to remove bookmark" };
    }
  }

  return { success: true };
}

export async function addMistakeManually(questionId: number): Promise<ActionResult> {
  const supabase = await createClient();
  const db = supabase as any;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  if (!Number.isInteger(questionId) || questionId <= 0) {
    return { success: false, error: "Invalid question id" };
  }

  const { data: existingData, error: selectError } = await db
    .from("mistakes")
    .select("error_count")
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .maybeSingle();

  if (selectError) {
    console.error("[practice-action] addMistakeManually(select) failed:", {
      questionId,
      userId: user.id,
      error: selectError,
    });
    return {
      success: false,
      error: selectError.message || "Failed to check existing mistake",
    };
  }

  if (existingData) {
    return { success: true };
  }

  const { error: insertError } = await db.from("mistakes").insert({
    user_id: user.id,
    question_id: questionId,
    error_count: 1,
    error_type: "manual",
    last_error_at: new Date().toISOString(),
  });

  if (insertError && insertError.code !== "23505") {
    console.error("[practice-action] addMistakeManually(insert) failed:", {
      questionId,
      userId: user.id,
      error: insertError,
    });
    return {
      success: false,
      error: insertError.message || "Failed to add mistake",
    };
  }

  return { success: true };
}

export async function recordWrongAnswerMistake(
  questionId: number,
  userAnswer: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const db = supabase as any;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  if (!Number.isInteger(questionId) || questionId <= 0) {
    return { success: false, error: "Invalid question id" };
  }

  const { data: existingData, error: selectError } = await db
    .from("mistakes")
    .select("error_count")
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .maybeSingle();

  if (selectError) {
    console.error("[practice-action] recordWrongAnswerMistake(select) failed:", {
      questionId,
      userId: user.id,
      error: selectError,
    });
    return {
      success: false,
      error: selectError.message || "Failed to check existing mistake",
    };
  }

  const existing = existingData as { error_count: number } | null;
  const newCount = (existing?.error_count || 0) + 1;

  const { error: upsertError } = await db.from("mistakes").upsert(
    {
      user_id: user.id,
      question_id: questionId,
      error_count: newCount,
      error_type: "wrong_answer",
      last_wrong_answer: userAnswer,
      last_error_at: new Date().toISOString(),
    },
    { onConflict: "user_id,question_id" },
  );

  if (upsertError) {
    console.error("[practice-action] recordWrongAnswerMistake(upsert) failed:", {
      questionId,
      userId: user.id,
      error: upsertError,
    });
    return {
      success: false,
      error: upsertError.message || "Failed to record mistake",
    };
  }

  return { success: true };
}
