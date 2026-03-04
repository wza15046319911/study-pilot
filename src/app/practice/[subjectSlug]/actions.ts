"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@/lib/supabase/server";

export type ActionResult = { success: true } | { success: false; error: string };

const NOTE_MAX_LENGTH = 500;

const normalizeNote = (note: string) => {
  return note.trim().length === 0 ? null : note;
};

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

export async function upsertBookmarkNote(
  questionId: number,
  note: string,
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

  if (typeof note !== "string") {
    return { success: false, error: "Invalid note" };
  }

  if (note.length > NOTE_MAX_LENGTH) {
    return { success: false, error: "Note is too long" };
  }

  const normalizedNote = normalizeNote(note);

  const { data: existingData, error: selectError } = await db
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .maybeSingle();

  if (selectError) {
    console.error("[practice-action] upsertBookmarkNote(select) failed:", {
      questionId,
      userId: user.id,
      error: selectError,
    });
    return {
      success: false,
      error: selectError.message || "Failed to check existing bookmark",
    };
  }

  if (existingData) {
    const { error: updateError } = await db
      .from("bookmarks")
      .update({ note: normalizedNote })
      .eq("id", existingData.id);

    if (updateError) {
      console.error("[practice-action] upsertBookmarkNote(update) failed:", {
        questionId,
        userId: user.id,
        error: updateError,
      });
      return {
        success: false,
        error: updateError.message || "Failed to update bookmark note",
      };
    }

    return { success: true };
  }

  if (!normalizedNote) {
    return { success: true };
  }

  const { error: insertError } = await db.from("bookmarks").insert({
    user_id: user.id,
    question_id: questionId,
    note: normalizedNote,
  });

  if (insertError && insertError.code !== "23505") {
    console.error("[practice-action] upsertBookmarkNote(insert) failed:", {
      questionId,
      userId: user.id,
      error: insertError,
    });
    return {
      success: false,
      error: insertError.message || "Failed to create bookmark note",
    };
  }

  if (insertError?.code === "23505") {
    const { error: retryUpdateError } = await db
      .from("bookmarks")
      .update({ note: normalizedNote })
      .eq("user_id", user.id)
      .eq("question_id", questionId);

    if (retryUpdateError) {
      console.error("[practice-action] upsertBookmarkNote(retry-update) failed:", {
        questionId,
        userId: user.id,
        error: retryUpdateError,
      });
      return {
        success: false,
        error: retryUpdateError.message || "Failed to update bookmark note",
      };
    }
  }

  return { success: true };
}

export async function upsertMistakeNote(
  questionId: number,
  note: string,
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

  if (typeof note !== "string") {
    return { success: false, error: "Invalid note" };
  }

  if (note.length > NOTE_MAX_LENGTH) {
    return { success: false, error: "Note is too long" };
  }

  const normalizedNote = normalizeNote(note);

  const { data: existingData, error: selectError } = await db
    .from("mistakes")
    .select("id")
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .maybeSingle();

  if (selectError) {
    console.error("[practice-action] upsertMistakeNote(select) failed:", {
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
    const { error: updateError } = await db
      .from("mistakes")
      .update({ note: normalizedNote })
      .eq("id", existingData.id);

    if (updateError) {
      console.error("[practice-action] upsertMistakeNote(update) failed:", {
        questionId,
        userId: user.id,
        error: updateError,
      });
      return {
        success: false,
        error: updateError.message || "Failed to update mistake note",
      };
    }

    return { success: true };
  }

  if (!normalizedNote) {
    return { success: true };
  }

  const { error: insertError } = await db.from("mistakes").insert({
    user_id: user.id,
    question_id: questionId,
    error_count: 1,
    error_type: "manual",
    last_error_at: new Date().toISOString(),
    note: normalizedNote,
  });

  if (insertError && insertError.code !== "23505") {
    console.error("[practice-action] upsertMistakeNote(insert) failed:", {
      questionId,
      userId: user.id,
      error: insertError,
    });
    return {
      success: false,
      error: insertError.message || "Failed to create mistake note",
    };
  }

  if (insertError?.code === "23505") {
    const { error: retryUpdateError } = await db
      .from("mistakes")
      .update({ note: normalizedNote })
      .eq("user_id", user.id)
      .eq("question_id", questionId);

    if (retryUpdateError) {
      console.error("[practice-action] upsertMistakeNote(retry-update) failed:", {
        questionId,
        userId: user.id,
        error: retryUpdateError,
      });
      return {
        success: false,
        error: retryUpdateError.message || "Failed to update mistake note",
      };
    }
  }

  return { success: true };
}
