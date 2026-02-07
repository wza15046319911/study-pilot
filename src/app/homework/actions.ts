"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type HomeworkSubmissionPayload = {
  homeworkId: number;
  answeredCount: number;
  correctCount: number;
  totalCount: number;
  mode?: string;
  durationSeconds?: number;
};

async function insertHomeworkSubmission(
  supabase: any,
  userId: string,
  payload: HomeworkSubmissionPayload,
) {
  const submissionPayload = {
    homework_id: payload.homeworkId,
    user_id: userId,
    submitted_at: new Date().toISOString(),
    answered_count: payload.answeredCount,
    correct_count: payload.correctCount,
    total_count: payload.totalCount,
    mode: payload.mode || "practice",
  };

  return (supabase.from("homework_submissions") as any).insert(
    submissionPayload,
  );
}

export async function saveHomeworkProgress(payload: HomeworkSubmissionPayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: assignment } = await supabase
    .from("homework_assignments")
    .select("id")
    .eq("homework_id", payload.homeworkId)
    .eq("user_id", user.id)
    .single();

  if (!assignment) {
    return { success: false, error: "Not assigned" };
  }

  const { error: submitError } = await insertHomeworkSubmission(
    supabase,
    user.id,
    payload,
  );

  if (submitError) {
    return { success: false, error: submitError.message };
  }

  revalidatePath("/profile/homework");
  revalidatePath("/profile");
  return { success: true };
}

export async function submitHomework(payload: HomeworkSubmissionPayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: assignment } = await supabase
    .from("homework_assignments")
    .select("id")
    .eq("homework_id", payload.homeworkId)
    .eq("user_id", user.id)
    .single();

  if (!assignment) {
    return { success: false, error: "Not assigned" };
  }

  const { error: submitError } = await insertHomeworkSubmission(
    supabase,
    user.id,
    payload,
  );

  if (submitError) {
    return { success: false, error: submitError.message };
  }

  await (supabase.from("homework_assignments") as any)
    .update({ completed_at: new Date().toISOString() })
    .eq("homework_id", payload.homeworkId)
    .eq("user_id", user.id);

  revalidatePath("/profile/homework");
  revalidatePath("/profile");
  return { success: true };
}
