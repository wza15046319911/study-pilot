"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AnswerMode = "practice" | "flashcard" | "immersive" | "exam";

/**
 * Records a user's answer to a question.
 * Used by all practice modes for comprehensive tracking.
 */
export async function recordAnswer(
  questionId: number,
  userAnswer: string,
  isCorrect: boolean,
  mode: AnswerMode,
  timeSpent?: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Insert into user_answers
  await (supabase as any).from("user_answers").insert({
    user_id: user.id,
    question_id: questionId,
    user_answer: userAnswer,
    is_correct: isCorrect,
    time_spent: timeSpent,
    mode: mode,
  });
  return { success: true };
}
