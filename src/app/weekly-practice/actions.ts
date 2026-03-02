"use server";

import { createClient } from "@/lib/supabase/server";

type WeeklyPracticeSubmissionPayload = {
  weeklyPracticeId: number;
  answeredCount: number;
  correctCount: number;
  totalCount: number;
  mode?: string;
  durationSeconds?: number;
};

async function insertWeeklyPracticeSubmission(
  supabase: any,
  userId: string,
  payload: WeeklyPracticeSubmissionPayload,
) {
  const submissionPayload = {
    weekly_practice_id: payload.weeklyPracticeId,
    user_id: userId,
    submitted_at: new Date().toISOString(),
    answered_count: payload.answeredCount,
    correct_count: payload.correctCount,
    total_count: payload.totalCount,
    mode: payload.mode || "practice",
  };

  return (supabase.from("weekly_practice_submissions") as any).insert(
    submissionPayload,
  );
}

export async function saveWeeklyPracticeProgress(
  payload: WeeklyPracticeSubmissionPayload,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error: submitError } = await insertWeeklyPracticeSubmission(
    supabase,
    user.id,
    payload,
  );

  if (submitError) {
    return { success: false, error: submitError.message };
  }

  return { success: true };
}

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

  const { error: submitError } = await insertWeeklyPracticeSubmission(
    supabase,
    user.id,
    payload,
  );

  if (submitError) {
    return { success: false, error: submitError.message };
  }

  return { success: true };
}
