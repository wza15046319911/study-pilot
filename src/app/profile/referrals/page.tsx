import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReferralDashboard } from "./ReferralDashboard";
import { Header } from "@/components/layout/Header";
// import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Profile } from "@/types/database";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import {
  getOrCreateReferralCode,
  getReferralStats,
  getReferralBanks,
  getUserUnlocks,
} from "@/lib/actions/referral";

export default async function ReferralsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile for Header
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  // Header user data construction
  const rawProfile = profile || {
    id: user.id,
    username: user.email?.split("@")[0] || "User",
    email: user.email,
    level: 1,
    streak_days: 0,
    avatar_url: null,
    created_at: new Date().toISOString(),
    last_practice_date: null,
    is_vip: false,
    vip_expires_at: null,
  };

  const userData = {
    ...rawProfile,
    avatar_url:
      rawProfile.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null,
  };

  const headerUser = {
    username: userData.username || user.user_metadata?.name || "User",
    avatar_url:
      userData.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      undefined,
    is_vip: userData.is_vip,
  };

  // Parallel data fetching
  const [referralCode, stats, referralBanks, userUnlocks] = await Promise.all([
    getOrCreateReferralCode(),
    getReferralStats(),
    getReferralBanks(),
    getUserUnlocks(),
  ]);

  // Filter out already unlocked banks from the available list
  const availableBanks = referralBanks.filter(
    (bank: any) => !userUnlocks.includes(bank.id)
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* <AmbientBackground /> */}
      <Header user={headerUser} />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="size-4" />
            <Link
              href="/profile"
              className="hover:text-blue-600 transition-colors"
            >
              Profile
            </Link>
            <ChevronRight className="size-4" />
            <span className="text-gray-900 dark:text-white font-medium">
              Referrals
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Invite Friends & Unlock
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
              Share the love of learning and earn premium rewards.
            </p>
          </div>

          <ReferralDashboard
            referralCode={referralCode || ""}
            stats={
              stats || {
                totalReferrals: 0,
                unusedReferrals: 0,
                unlockedBanks: 0,
              }
            }
            banks={availableBanks}
            userId={user.id}
          />
        </div>
      </main>
    </div>
  );
}
