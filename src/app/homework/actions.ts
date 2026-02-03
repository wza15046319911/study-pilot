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

  const submissionPayload = {
    homework_id: payload.homeworkId,
    user_id: user.id,
    submitted_at: new Date().toISOString(),
    answered_count: payload.answeredCount,
    correct_count: payload.correctCount,
    total_count: payload.totalCount,
    mode: payload.mode || "practice",
  };

  const { error: submitError } = await (
    supabase.from("homework_submissions") as any
  ).insert(submissionPayload);

  if (submitError) {
    return { success: false, error: submitError.message };
  }

  await (supabase.from("homework_assignments") as any)
    .update({ completed_at: new Date().toISOString() })
    .eq("homework_id", payload.homeworkId)
    .eq("user_id", user.id);

  revalidatePath("/profile/homework");
  return { success: true };
}
