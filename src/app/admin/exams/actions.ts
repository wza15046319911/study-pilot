"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteExam(examId: number) {
  // Check authentication first
  const userSupabase = await createClient();
  const {
    data: { user },
  } = await userSupabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  // Use admin client to bypass RLS
  const supabase = createAdminClient();

  // Delete the exam
  // Note: exam_questions and exam_attempts will be automatically deleted
  // due to ON DELETE CASCADE constraints
  const { error } = await supabase.from("exams").delete().eq("id", examId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/exams");
  return { success: true };
}
