"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createWeeklyPractice(data: {
  subjectId: number;
  title: string;
  slug: string;
  description?: string;
  weekStart?: string | null;
  allowedModes: string[];
  isPublished: boolean;
  questionIds: number[];
}) {
  const supabase = await createClient();

  const { data: practice, error: insertError } = await (
    supabase.from("weekly_practices") as any
  )
    .insert({
      title: data.title,
      slug: data.slug,
      description: data.description,
      subject_id: data.subjectId,
      week_start: data.weekStart,
      allowed_modes: data.allowedModes,
      is_published: data.isPublished,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError || !practice) {
    throw new Error(insertError?.message || "Failed to create weekly practice");
  }

  if (data.questionIds.length > 0) {
    const items = data.questionIds.map((questionId, index) => ({
      weekly_practice_id: practice.id,
      question_id: questionId,
      order_index: index,
    }));

    const { error: itemsError } = await (
      supabase.from("weekly_practice_items") as any
    ).insert(items);

    if (itemsError) {
      await supabase.from("weekly_practices").delete().eq("id", practice.id);
      throw new Error(itemsError.message);
    }
  }

  revalidatePath("/admin/weekly-practice");
  return { success: true, weeklyPracticeId: practice.id };
}

export async function updateWeeklyPractice(data: {
  weeklyPracticeId: number;
  subjectId: number;
  title: string;
  slug: string;
  description?: string;
  weekStart?: string | null;
  allowedModes: string[];
  isPublished: boolean;
  questionIds: number[];
}) {
  const supabase = await createClient();

  const { error: updateError } = await (
    supabase.from("weekly_practices") as any
  )
    .update({
      title: data.title,
      slug: data.slug,
      description: data.description,
      subject_id: data.subjectId,
      week_start: data.weekStart,
      allowed_modes: data.allowedModes,
      is_published: data.isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.weeklyPracticeId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: deleteError } = await (
    supabase.from("weekly_practice_items") as any
  )
    .delete()
    .eq("weekly_practice_id", data.weeklyPracticeId);

  if (deleteError) {
    throw new Error("Failed to clear old items: " + deleteError.message);
  }

  if (data.questionIds.length > 0) {
    const items = data.questionIds.map((questionId, index) => ({
      weekly_practice_id: data.weeklyPracticeId,
      question_id: questionId,
      order_index: index,
    }));

    const { error: insertError } = await (
      supabase.from("weekly_practice_items") as any
    ).insert(items);

    if (insertError) {
      throw new Error("Failed to insert items: " + insertError.message);
    }
  }

  revalidatePath("/admin/weekly-practice");
  revalidatePath(`/admin/weekly-practice/${data.weeklyPracticeId}`);
  return { success: true };
}

export async function deleteWeeklyPractice(weeklyPracticeId: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("weekly_practices")
    .delete()
    .eq("id", weeklyPracticeId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/weekly-practice");
  return { success: true };
}
