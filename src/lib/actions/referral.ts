"use server";

import { randomBytes } from "crypto";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { rateLimitPresets } from "@/lib/rateLimit";
import { BankIdSchema, validateInput } from "@/lib/validation";

// Generate a cryptographically secure random 6-character code
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars like I, 1, O, 0
  const bytes = randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(bytes[i] % chars.length);
  }
  return code;
}

export async function getOrCreateReferralCode() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Rate limit: 5 requests per minute
  const { success: allowed } = await rateLimitPresets.strict(
    `referral:create:${user.id}`
  );
  if (!allowed) {
    throw new Error("Too many requests. Please try again later.");
  }

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

export async function getReferralStats(userId?: string) {
  const supabase = await createClient();
  let targetUserId = userId;

  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    targetUserId = user.id;
  }

  // Get total referrals
  const [totalReferralsResult, unusedReferralsResult, unlockedBanksResult] =
    await Promise.all([
      (supabase.from("referrals") as any)
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", targetUserId),
      (supabase.from("referrals") as any)
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", targetUserId)
        .eq("used_for_unlock", false),
      (supabase.from("user_bank_unlocks") as any)
        .select("*", { count: "exact", head: true })
        .eq("user_id", targetUserId)
        .eq("unlock_type", "referral"),
    ]);

  return {
    totalReferrals: totalReferralsResult.count || 0,
    unusedReferrals: unusedReferralsResult.count || 0,
    unlockedBanks: unlockedBanksResult.count || 0,
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
  // Validate input
  const validation = validateInput(BankIdSchema, bankId);
  if (!validation.success) {
    throw new Error(validation.error);
  }

  const supabase = await createClient(); // Keep for auth check
  const adminClient = createAdminClient(); // For database mutations

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Rate limit: 5 requests per minute
  const { success: allowed } = await rateLimitPresets.strict(
    `referral:unlock:${user.id}`
  );
  if (!allowed) {
    throw new Error("Too many requests. Please try again later.");
  }

  // 1. Check if already unlocked (user can read their own unlocks via RLS)
  const { data: existing } = await (supabase.from("user_bank_unlocks") as any)
    .select("id")
    .eq("user_id", user.id)
    .eq("bank_id", bankId)
    .single();

  if (existing) return { success: true, message: "Already unlocked" };

  // 2. Find an unused referral (user can read their own referrals via RLS)
  const { data: referral } = await (supabase.from("referrals") as any)
    .select("id, referee_id")
    .eq("referrer_id", user.id)
    .eq("used_for_unlock", false)
    .limit(1)
    .single();

  if (!referral) {
    throw new Error("No unlock chances available");
  }

  // 3. Perform Unlock Transaction using ADMIN CLIENT to bypass RLS restrictions
  // (Specifically, there is no public RLS policy for updating referrals)

  // A. Mark referral as used
  const { error: updateError } = await (adminClient.from("referrals") as any)
    .update({
      used_for_unlock: true,
      unlocked_bank_id: bankId,
    })
    .eq("id", referral.id);

  if (updateError) {
    console.error("Failed to consume referral:", updateError);
    throw new Error("Failed to consume referral");
  }

  // B. Unlock for Referrer (User A)
  const { error: unlockAError } = await (
    adminClient.from("user_bank_unlocks") as any
  ).insert({
    user_id: user.id,
    bank_id: bankId,
    unlock_type: "referral",
    referral_id: referral.id,
  });

  if (unlockAError) {
    console.error("Failed to unlock for referrer:", unlockAError);
    // Rollback referral usage (best effort)
    await (adminClient.from("referrals") as any)
      .update({ used_for_unlock: false, unlocked_bank_id: null })
      .eq("id", referral.id);
    throw new Error("Failed to unlock for you");
  }

  // C. Unlock for Referee (User B - the friend)
  // They get the same bank unlocked for free!
  const { error: unlockBError } = await (
    adminClient.from("user_bank_unlocks") as any
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
