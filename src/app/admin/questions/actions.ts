"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface QuestionUpdate {
  title?: string;
  content?: string;
  answer?: string;
  explanation?: string | null;
  difficulty?: "easy" | "medium" | "hard";
  code_snippet?: string | null;
  tags?: string[] | null;
  options?: { label: string; content: string }[] | null;
}

export async function updateQuestion(id: number, data: QuestionUpdate) {
  const userSupabase = await createClient();
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const supabase = createAdminClient();

  const { error, data: result } = await (supabase as any)
    .from("questions")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update question error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/questions");
  return { success: true, data: result };
}

export async function deleteQuestion(id: number) {
  const userSupabase = await createClient();
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("questions").delete().eq("id", id);

  if (error) {
    console.error("Delete question error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/questions");
  return { success: true };
}
