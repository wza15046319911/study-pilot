"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
export async function saveFlashcardReview(
  questionId: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Upsert into DB
  const { error } = await supabase.from("flashcard_reviews").upsert(
    {
      user_id: user.id,
      question_id: questionId,
      next_review_at: new Date().toISOString(),
      interval_days: 0,
      ease_factor: 2.5,
      repetitions: 0,
      last_reviewed_at: new Date().toISOString(),
    } as any,
    { onConflict: "user_id,question_id" }
  );

  if (error) {
    console.error("Failed to save SRS review:", error);
    return { success: false, error: error.message };
  }

  // We should also record a "user_answer" or "progress" if needed,
  // but for flashcards, the review schedule is the most important.
  // We can optionally update user_progress counts here too.

  revalidatePath("/practice");
  return { success: true };
}
