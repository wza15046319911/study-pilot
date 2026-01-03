"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { calculateSM2, SRSQuality } from "@/lib/srs";

export async function saveFlashcardReview(
  questionId: number,
  quality: SRSQuality, // 0-5
  currentInterval: number,
  currentEase: number,
  currentRepetitions: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Calculate next schedule
  const nextSchedule = calculateSM2(
    quality,
    currentInterval,
    currentEase,
    currentRepetitions
  );

  // Upsert into DB
  const { error } = await supabase.from("flashcard_reviews").upsert(
    {
      user_id: user.id,
      question_id: questionId,
      next_review_at: nextSchedule.nextReviewAt.toISOString(),
      interval_days: nextSchedule.intervalDays,
      ease_factor: nextSchedule.easeFactor,
      repetitions: nextSchedule.repetitions,
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
  return { success: true, data: nextSchedule };
}
