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

  const [referralRowsResult, unlockedBanksResult] = await Promise.all([
    (supabase.from("referrals") as any)
      .select(
        "referrer_id, referee_id, used_for_unlock, referrer_used_for_unlock, referee_used_for_unlock"
      )
      .or(`referrer_id.eq.${targetUserId},referee_id.eq.${targetUserId}`),
    (supabase.from("user_bank_unlocks") as any)
      .select("*", { count: "exact", head: true })
      .eq("user_id", targetUserId)
      .eq("unlock_type", "referral"),
  ]);

  const referralRows =
    (referralRowsResult.data as
      | {
          referrer_id: string;
          referee_id: string;
          used_for_unlock?: boolean | null;
          referrer_used_for_unlock?: boolean | null;
          referee_used_for_unlock?: boolean | null;
        }[]
      | null) || [];

  const totalReferrals = referralRows.filter(
    (row) => row.referrer_id === targetUserId
  ).length;
  const unusedAsReferrer = referralRows.filter((row) => {
    if (row.referrer_id !== targetUserId) return false;
    return !(
      row.referrer_used_for_unlock ??
      row.used_for_unlock ??
      false
    );
  }).length;
  const unusedAsReferee = referralRows.filter((row) => {
    if (row.referee_id !== targetUserId) return false;
    return !(row.referee_used_for_unlock ?? false);
  }).length;

  return {
    totalReferrals,
    unusedReferrals: unusedAsReferrer + unusedAsReferee,
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

  // 2. Find an unused referral credit where current user is either referrer or referee.
  const { data: referrals } = await (supabase.from("referrals") as any)
    .select(
      "id, referrer_id, referee_id, used_for_unlock, referrer_used_for_unlock, referee_used_for_unlock"
    )
    .or(`referrer_id.eq.${user.id},referee_id.eq.${user.id}`)
    .order("created_at", { ascending: true });

  const referralList =
    (referrals as
      | {
          id: number;
          referrer_id: string;
          referee_id: string;
          used_for_unlock?: boolean | null;
          referrer_used_for_unlock?: boolean | null;
          referee_used_for_unlock?: boolean | null;
        }[]
      | null) || [];

  const referral = referralList.find((row) => {
    if (row.referrer_id === user.id) {
      return !(
        row.referrer_used_for_unlock ??
        row.used_for_unlock ??
        false
      );
    }
    if (row.referee_id === user.id) {
      return !(row.referee_used_for_unlock ?? false);
    }
    return false;
  });

  if (!referral) {
    throw new Error("No unlock chances available");
  }

  const isReferrerCredit = referral.referrer_id === user.id;

  // 3. Consume one credit for current user.
  const updatePayload = isReferrerCredit
    ? {
        referrer_used_for_unlock: true,
        referrer_unlocked_bank_id: bankId,
        // Keep legacy fields aligned for historical/admin views.
        used_for_unlock: true,
        unlocked_bank_id: bankId,
      }
    : {
        referee_used_for_unlock: true,
        referee_unlocked_bank_id: bankId,
      };
  const { error: updateError } = await (adminClient.from("referrals") as any)
    .update(updatePayload)
    .eq("id", referral.id);

  if (updateError) {
    console.error("Failed to consume referral:", updateError);
    throw new Error("Failed to consume referral");
  }

  // 4. Unlock selected bank for current user only.
  const { error: unlockError } = await (
    adminClient.from("user_bank_unlocks") as any
  ).insert({
    user_id: user.id,
    bank_id: bankId,
    unlock_type: "referral",
    referral_id: referral.id,
  });

  if (unlockError) {
    console.error("Failed to unlock with referral credit:", unlockError);
    // Rollback referral usage (best effort)
    const rollbackPayload = isReferrerCredit
      ? {
          referrer_used_for_unlock: false,
          referrer_unlocked_bank_id: null,
          used_for_unlock: false,
          unlocked_bank_id: null,
        }
      : {
          referee_used_for_unlock: false,
          referee_unlocked_bank_id: null,
        };
    await (adminClient.from("referrals") as any)
      .update(rollbackPayload)
      .eq("id", referral.id);
    throw new Error("Failed to unlock for you");
  }

  revalidatePath("/profile/referrals");
  revalidatePath("/library");
  return { success: true };
}
