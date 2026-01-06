"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Generate a random 6-character code
function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars like I, 1, O, 0
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function getOrCreateReferralCode() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Check if exists
  const { data: existing } = await (supabase.from("referral_codes") as any)
    .select("code")
    .eq("user_id", user.id)
    .single();

  if (existing) return (existing as { code: string }).code;

  // Create new
  let code = generateCode();
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 5) {
    const { data } = await (supabase.from("referral_codes") as any)
      .select("id")
      .eq("code", code)
      .single();

    if (!data) {
      isUnique = true;
    } else {
      code = generateCode();
      attempts++;
    }
  }

  if (!isUnique) throw new Error("Failed to generate unique referral code");

  const { error } = await (supabase.from("referral_codes") as any).insert({
    user_id: user.id,
    code,
  });

  if (error) {
    console.error("Error creating referral code:", error);
    throw new Error("Failed to create referral code");
  }

  return code;
}

export async function getReferralStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get total referrals
  const { count: totalReferrals } = await (supabase.from("referrals") as any)
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", user.id);

  // Get unused unlocks (referrals not yet used for unlock)
  const { count: unusedReferrals } = await (supabase.from("referrals") as any)
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", user.id)
    .eq("used_for_unlock", false);

  // Get unlocked banks count
  const { count: unlockedBanks } = await (
    supabase.from("user_bank_unlocks") as any
  )
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("unlock_type", "referral");

  return {
    totalReferrals: totalReferrals || 0,
    unusedReferrals: unusedReferrals || 0,
    unlockedBanks: unlockedBanks || 0,
  };
}

export async function getReferralBanks() {
  const supabase = await createClient();

  // Fetch banks that are of type 'referral'
  const { data: banks } = await (supabase.from("question_banks") as any)
    .select(
      `
      *,
      subject:subjects(name, icon),
      items:question_bank_items(count)
    `
    )
    .eq("unlock_type", "referral")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return banks || [];
}

export async function getUserUnlocks() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: unlocks } = await (supabase.from("user_bank_unlocks") as any)
    .select("bank_id")
    .eq("user_id", user.id);

  return ((unlocks || []) as { bank_id: number }[]).map((u) => u.bank_id);
}

export async function unlockBankWithReferral(bankId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // 1. Check if already unlocked
  const { data: existing } = await (supabase.from("user_bank_unlocks") as any)
    .select("id")
    .eq("user_id", user.id)
    .eq("bank_id", bankId)
    .single();

  if (existing) return { success: true, message: "Already unlocked" };

  // 2. Find an unused referral
  const { data: referral } = await (supabase.from("referrals") as any)
    .select("id, referee_id")
    .eq("referrer_id", user.id)
    .eq("used_for_unlock", false)
    .limit(1)
    .single();

  if (!referral) {
    throw new Error("No unlock chances available");
  }

  // 3. Perform Unlock Transaction (simulated with sequential ops since no RPC yet)
  // Ideally this should be a stored procedure to ensure atomicity

  // A. Mark referral as used
  const { error: updateError } = await (supabase.from("referrals") as any)
    .update({
      used_for_unlock: true,
      unlocked_bank_id: bankId,
    })
    .eq("id", referral.id);

  if (updateError) throw new Error("Failed to consume referral");

  // B. Unlock for Referrer (User A)
  const { error: unlockAError } = await (
    supabase.from("user_bank_unlocks") as any
  ).insert({
    user_id: user.id,
    bank_id: bankId,
    unlock_type: "referral",
    referral_id: referral.id,
  });

  if (unlockAError) {
    // Rollback referral usage (best effort)
    await (supabase.from("referrals") as any)
      .update({ used_for_unlock: false, unlocked_bank_id: null })
      .eq("id", referral.id);
    throw new Error("Failed to unlock for you");
  }

  // C. Unlock for Referee (User B - the friend)
  // They get the same bank unlocked for free!
  const { error: unlockBError } = await (
    supabase.from("user_bank_unlocks") as any
  ).insert({
    user_id: referral.referee_id,
    bank_id: bankId,
    unlock_type: "referral",
    referral_id: referral.id, // Link to same referral
  });

  // Note: If C fails, A still has it unlocked. We might just log this error.
  if (unlockBError) {
    console.error("Failed to unlock for referee:", unlockBError);
  }

  revalidatePath("/profile/referrals");
  revalidatePath("/library");
  return { success: true };
}
