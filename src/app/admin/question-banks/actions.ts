"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createQuestionBank(data: {
  subjectId: number;
  title: string;
  slug: string;
  description?: string;
  unlockType: "free" | "premium" | "referral" | "paid";
  price?: number | null;
  isPublished: boolean;
  questionIds: number[];
}) {
  const supabase = await createClient();

  // Map unlock_type to is_premium for backwards compatibility
  const isPremium = data.unlockType === "premium";

  // 1. Create Question Bank Metadata
  const { data: bank, error: bankError } = await (
    supabase.from("question_banks") as any
  )
    .insert({
      title: data.title,
      slug: data.slug,
      description: data.description,
      subject_id: data.subjectId,
      is_premium: isPremium,
      unlock_type: data.unlockType,
      price: data.unlockType === "paid" ? data.price : null,
      is_published: data.isPublished,
    } as any)
    .select()
    .single();

  if (bankError || !bank) {
    throw new Error(bankError?.message || "Failed to create bank");
  }

  // 2. Insert Question Items
  if (data.questionIds.length > 0) {
    const items = data.questionIds.map((qid, index) => ({
      bank_id: (bank as any).id,
      question_id: qid,
      order_index: index,
    }));

    const { error: itemsError } = await (
      supabase.from("question_bank_items") as any
    )
      // .insert(items as any) - previously casted, keeping it simple
      .insert(items);

    if (itemsError) {
      // Cleanup on failure (optional, but good practice)
      await supabase
        .from("question_banks")
        .delete()
        .eq("id", (bank as any).id);
      throw new Error(itemsError.message);
    }
  }

  revalidatePath("/admin/question-banks");
  return { success: true, bankId: (bank as any).id };
}

export async function updateQuestionBank(data: {
  bankId: number;
  subjectId: number;
  title: string;
  slug: string;
  description?: string;
  unlockType: "free" | "premium" | "referral" | "paid";
  price?: number | null;
  isPublished: boolean;
  questionIds: number[];
}) {
  const supabase = await createClient();

  // Map unlock_type to is_premium for backwards compatibility
  const isPremium = data.unlockType === "premium";

  // 1. Update Metadata
  const { error: bankError } = await (supabase.from("question_banks") as any)
    .update({
      title: data.title,
      slug: data.slug,
      description: data.description,
      subject_id: data.subjectId,
      is_premium: isPremium,
      unlock_type: data.unlockType,
      price: data.unlockType === "paid" ? data.price : null,
      is_published: data.isPublished,
    } as any)
    .eq("id", data.bankId);

  if (bankError) {
    throw new Error(bankError.message);
  }

  // 2. Update Items (Delete all and re-insert for simplicity)
  // Making this transactional would be better, but Supabase HTTP api doesn't support complex transactions easily without RPC.
  // We'll delete and re-insert.

  const { error: deleteError } = await (
    supabase.from("question_bank_items") as any
  )
    .delete()
    .eq("bank_id", data.bankId);

  if (deleteError) {
    throw new Error("Failed to clear old items: " + deleteError.message);
  }

  if (data.questionIds.length > 0) {
    const items = data.questionIds.map((qid, index) => ({
      bank_id: data.bankId,
      question_id: qid,
      order_index: index,
    }));

    const { error: insertError } = await (
      supabase.from("question_bank_items") as any
    ).insert(items);

    if (insertError) {
      throw new Error("Failed to insert new items: " + insertError.message);
    }
  }

  revalidatePath("/admin/question-banks");
  revalidatePath(`/admin/question-banks/${data.bankId}`);
  return { success: true };
}
