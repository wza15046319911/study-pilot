"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Search users by email or username
export async function searchUsers(query: string) {
  if (!query || query.length < 2) return [];

  const supabase = await createClient();

  const { data: profiles } = await (supabase.from("profiles") as any)
    .select("id, username, avatar_url, is_vip")
    .ilike("username", `%${query}%`)
    .limit(10);

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return ((profiles as any[]) || []).map((profile: any) => ({
      ...profile,
      email: null,
    }));
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    return ((profiles as any[]) || []).map((profile: any) => ({
      ...profile,
      email: null,
    }));
  }

  const emailMap = new Map<string, string>();
  (data?.users || []).forEach((user) => {
    if (user.id && user.email) {
      emailMap.set(user.id, user.email);
    }
  });

  return ((profiles as any[]) || []).map((profile: any) => ({
    ...profile,
    email: emailMap.get(profile.id) || null,
  }));
}

// Get user's current unlocks
export async function getUserUnlocksAdmin(userId: string) {
  const supabase = await createClient();

  const { data: unlocks } = await (supabase.from("user_bank_unlocks") as any)
    .select(
      `
      id,
      bank_id,
      unlock_type,
      created_at,
      bank:question_banks!bank_id(id, title, slug)
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return unlocks || [];
}

// Manually grant bank access to a user
export async function grantBankAccess(userId: string, bankId: number) {
  const supabase = await createClient();

  // Check if already unlocked
  const { data: existing } = await (supabase.from("user_bank_unlocks") as any)
    .select("id")
    .eq("user_id", userId)
    .eq("bank_id", bankId)
    .single();

  if (existing) {
    return { success: false, message: "User already has access to this bank" };
  }

  // Grant access
  const { error } = await supabase.from("user_bank_unlocks").insert({
    user_id: userId,
    bank_id: bankId,
    unlock_type: "admin",
  } as any);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/unlocks");
  return { success: true };
}

// Revoke bank access from a user
export async function revokeBankAccess(unlockId: number) {
  const supabase = await createClient();

  const { error } = await (supabase.from("user_bank_unlocks") as any)
    .delete()
    .eq("id", unlockId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/unlocks");
  return { success: true };
}

// Get all referral-type banks for selection
export async function getReferralBanksAdmin() {
  const supabase = await createClient();

  const { data: banks } = await (supabase.from("question_banks") as any)
    .select("id, title, slug")
    .eq("unlock_type", "referral")
    .eq("is_published", true)
    .order("title");

  return banks || [];
}

// Get all unlock records with pagination
export async function getAllUnlocks(page = 1, limit = 20) {
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  const { data: unlocks, count } = await (
    supabase.from("user_bank_unlocks") as any
  )
    .select(
      `
      id,
      user_id,
      bank_id,
      unlock_type,
      created_at,
      user:profiles!user_id(username, avatar_url),
      bank:question_banks!bank_id(title)
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return {
    unlocks: unlocks || [],
    total: count || 0,
    pages: Math.ceil((count || 0) / limit),
  };
}
