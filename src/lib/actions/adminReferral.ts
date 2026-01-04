"use server";

import { createClient } from "@/lib/supabase/server";

// Get aggregate referral statistics
export async function getAdminReferralStats(
  timeRange: "today" | "week" | "month" | "all" = "all"
) {
  const supabase = await createClient();

  let dateFilter = "";
  const now = new Date();

  if (timeRange === "today") {
    dateFilter = new Date(now.setHours(0, 0, 0, 0)).toISOString();
  } else if (timeRange === "week") {
    dateFilter = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
  } else if (timeRange === "month") {
    dateFilter = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();
  }

  // Total referrals
  let referralQuery = supabase
    .from("referrals")
    .select("*", { count: "exact", head: true });

  if (dateFilter) {
    referralQuery = referralQuery.gte("created_at", dateFilter);
  }

  const { count: totalReferrals } = await referralQuery;

  // Successful unlocks
  let unlockQuery = supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("used_for_unlock", true);

  if (dateFilter) {
    unlockQuery = unlockQuery.gte("created_at", dateFilter);
  }

  const { count: totalUnlocks } = await unlockQuery;

  // Total unique referral codes created
  let codesQuery = supabase
    .from("referral_codes")
    .select("*", { count: "exact", head: true });

  if (dateFilter) {
    codesQuery = codesQuery.gte("created_at", dateFilter);
  }

  const { count: totalCodes } = await codesQuery;

  return {
    totalReferrals: totalReferrals || 0,
    totalUnlocks: totalUnlocks || 0,
    totalCodes: totalCodes || 0,
    conversionRate: totalReferrals
      ? Math.round(((totalUnlocks || 0) / totalReferrals) * 100)
      : 0,
  };
}

// Get top referrers leaderboard
export async function getTopReferrers(limit = 10) {
  const supabase = await createClient();

  // Get referral counts grouped by referrer
  const { data: referrals } = await (supabase.from("referrals") as any).select(
    "referrer_id"
  );

  if (!referrals || referrals.length === 0) return [];

  // Count referrals per user
  const counts: Record<string, number> = {};
  (referrals as { referrer_id: string }[]).forEach((r) => {
    counts[r.referrer_id] = (counts[r.referrer_id] || 0) + 1;
  });

  // Sort and get top referrers
  const sortedUserIds = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([userId]) => userId);

  if (sortedUserIds.length === 0) return [];

  // Get user profiles
  const { data: profiles } = await (supabase.from("profiles") as any)
    .select("id, username, avatar_url")
    .in("id", sortedUserIds);

  // Build leaderboard with counts
  type ProfileData = {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
  const leaderboard = sortedUserIds.map((userId) => {
    const profile = (profiles as ProfileData[] | null)?.find(
      (p) => p.id === userId
    );
    return {
      userId,
      username: profile?.username || "Unknown",
      avatarUrl: profile?.avatar_url,
      referralCount: counts[userId],
    };
  });

  return leaderboard;
}

// Get bank unlock statistics
export async function getBankUnlockStats() {
  const supabase = await createClient();

  const { data: unlocks } = await (supabase.from("user_bank_unlocks") as any)
    .select("bank_id")
    .eq("unlock_type", "referral");

  if (!unlocks || unlocks.length === 0) return [];

  // Count unlocks per bank
  const counts: Record<number, number> = {};
  (unlocks as { bank_id: number }[]).forEach((u) => {
    counts[u.bank_id] = (counts[u.bank_id] || 0) + 1;
  });

  // Get bank details
  const bankIds = Object.keys(counts).map(Number);
  const { data: banks } = await (supabase.from("question_banks") as any)
    .select("id, title, slug")
    .in("id", bankIds);

  return bankIds
    .map((bankId) => ({
      bankId,
      title: banks?.find((b: any) => b.id === bankId)?.title || "Unknown Bank",
      slug: banks?.find((b: any) => b.id === bankId)?.slug,
      unlockCount: counts[bankId],
    }))
    .sort((a, b) => b.unlockCount - a.unlockCount);
}

// Get recent referrals list
export async function getRecentReferrals(limit = 20) {
  const supabase = await createClient();

  const { data: referrals } = await (supabase.from("referrals") as any)
    .select(
      `
      id,
      created_at,
      used_for_unlock,
      unlocked_bank_id,
      referrer:profiles!referrer_id(username, avatar_url),
      referee:profiles!referee_id(username, avatar_url)
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  return referrals || [];
}
