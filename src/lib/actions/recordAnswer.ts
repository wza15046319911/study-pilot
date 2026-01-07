"use server";

import { createClient } from "@/lib/supabase/server";
import { RecordAnswerSchema } from "@/lib/validation";
import { rateLimitPresets } from "@/lib/rateLimit";

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
  // Validate input
  const validation = RecordAnswerSchema.safeParse({
    questionId,
    userAnswer,
    isCorrect,
    mode,
    timeSpent,
  });

  if (!validation.success) {
    return { success: false, error: "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Rate limit: 100 requests per minute (relaxed for answer submissions)
  const { success: allowed } = await rateLimitPresets.relaxed(
    `answer:${user.id}`
  );
  if (!allowed) {
    return { success: false, error: "Too many requests" };
  }

  // Insert into user_answers
  await (supabase as any).from("user_answers").insert({
    user_id: user.id,
    question_id: validation.data.questionId,
    user_answer: validation.data.userAnswer,
    is_correct: validation.data.isCorrect,
    time_spent: validation.data.timeSpent,
    mode: validation.data.mode,
  });
  return { success: true };
}
