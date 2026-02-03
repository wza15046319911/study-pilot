"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type WeeklyPracticeSubmissionPayload = {
  weeklyPracticeId: number;
  answeredCount: number;
  correctCount: number;
  totalCount: number;
  mode?: string;
  durationSeconds?: number;
};

export async function submitWeeklyPractice(
  payload: WeeklyPracticeSubmissionPayload
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const submissionPayload = {
    weekly_practice_id: payload.weeklyPracticeId,
    user_id: user.id,
    submitted_at: new Date().toISOString(),
    answered_count: payload.answeredCount,
    correct_count: payload.correctCount,
    total_count: payload.totalCount,
    mode: payload.mode || "practice",
  };

  const { error: submitError } = await (
    supabase.from("weekly_practice_submissions") as any
  ).insert(submissionPayload);

  if (submitError) {
    return { success: false, error: submitError.message };
  }

  revalidatePath("/profile/weekly-practice");
  return { success: true };
}
