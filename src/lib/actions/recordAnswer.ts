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

  // Get the question's subject_id and topic_id for progress update
  const { data: questionData } = await supabase
    .from("questions")
    .select("subject_id, topic_id")
    .eq("id", questionId)
    .single();

  const question = questionData as {
    subject_id: number;
    topic_id: number | null;
  } | null;

  if (question) {
    // Use the RPC function (will be available after running migration)
    await (supabase as any).rpc("increment_subject_progress", {
      p_user_id: user.id,
      p_subject_id: question.subject_id,
      p_is_correct: isCorrect,
    });

    if (question.topic_id) {
      await (supabase as any).rpc("increment_topic_progress", {
        p_user_id: user.id,
        p_topic_id: question.topic_id,
        p_is_correct: isCorrect,
      });
    }
  }

  revalidatePath("/profile");
  return { success: true };
}
