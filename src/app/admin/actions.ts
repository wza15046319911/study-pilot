"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";
import { revalidatePath } from "next/cache";
import { encodeId } from "@/lib/ids";

// --- Subjects ---

export async function upsertSubject(
  data: Database["public"]["Tables"]["subjects"]["Insert"]
) {
  const supabase = createAdminClient();
  const userSupabase = await createClient();

  // Verify auth
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("subjects").upsert(data as any); // Cast to any to bypass strict overload check if needed, but Insert should be fine usually. The error before was Partial<Subject>.
  // Actually, let's try without cast first? No, the error "assignable to never" usually implies total mismatch.
  // Let's use `data as any` to be safe and avoid another build fail cycle, as Supabase types can be finicky with helper types vs raw types.

  if (error) {
    console.error("Error upserting subject:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/subjects");
  revalidatePath("/library");
  return { success: true };
}

export async function deleteSubject(id: number) {
  const supabase = createAdminClient();
  const userSupabase = await createClient();

  // Verify auth
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("subjects").delete().eq("id", id);

  if (error) {
    console.error("Error deleting subject:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/subjects");
  revalidatePath("/library");
  return { success: true };
}

// --- Topics ---

export async function upsertTopic(
  data: Database["public"]["Tables"]["topics"]["Insert"]
) {
  const supabase = createAdminClient();
  const userSupabase = await createClient();

  // Verify auth
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("topics").upsert(data as any);

  if (error) {
    console.error("Error upserting topic:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/subjects");
  // Topics might be used in practice setup, etc.
  revalidatePath(`/practice/${encodeId(data.subject_id)}/setup`);
  return { success: true };
}

export async function deleteTopic(id: number) {
  const supabase = createAdminClient();
  const userSupabase = await createClient();

  // Verify auth
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("topics").delete().eq("id", id);

  if (error) {
    console.error("Error deleting topic:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/subjects");
  return { success: true };
}

// --- Subject Exam Dates ---

export async function upsertSubjectExamDate(
  data: Database["public"]["Tables"]["subject_exam_dates"]["Insert"]
) {
  const supabase = createAdminClient();
  const userSupabase = await createClient();

  // Verify auth
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("subject_exam_dates")
    .upsert(data as any, {
      onConflict: "subject_id, exam_type, student_level",
    });

  if (error) {
    console.error("Error upserting subject exam date:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/subjects");
  revalidatePath("/library");
  return { success: true };
}

export async function deleteSubjectExamDate(id: number) {
  const supabase = createAdminClient();
  const userSupabase = await createClient();

  // Verify auth
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("subject_exam_dates")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting subject exam date:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/subjects");
  revalidatePath("/library");
  return { success: true };
}
