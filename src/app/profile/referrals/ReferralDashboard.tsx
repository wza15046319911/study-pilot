"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { UnlockBankModal } from "./UnlockBankModal";
import { InviteCard } from "@/components/referral/InviteCard";
import { Users, LockOpen, Trophy, Info } from "lucide-react";
import { useTranslations } from "next-intl";

interface ReferralDashboardProps {
  referralCode: string;
  stats: {
    totalReferrals: number;
    unusedReferrals: number;
    unlockedBanks: number;
  };
  banks: any[]; // Available banks to unlock
}

export function ReferralDashboard({
  referralCode,
  stats,
  banks,
}: ReferralDashboardProps) {
  const t = useTranslations("profileReferrals.dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassPanel className="p-6 flex items-center gap-4">
          <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="size-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("stats.friendsInvited")}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalReferrals}
            </p>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6 flex items-center gap-4">
          <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
            <Trophy className="size-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("stats.unlockChances")}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.unusedReferrals}
            </p>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6 flex items-center gap-4">
          <div className="size-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <LockOpen className="size-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("stats.banksUnlocked")}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.unlockedBanks}
            </p>
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Invite Code & Actions */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("invite.title")}
            </h2>
            <InviteCard code={referralCode} />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <LockOpen className="size-5 text-[#135bec]" />
                  {t("unlock.title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-md text-sm">
                  {t("unlock.description", { count: stats.unusedReferrals })}
                </p>
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                disabled={stats.unusedReferrals === 0}
                className="whitespace-nowrap bg-[#135bec] hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              >
                {t("unlock.cta")}
              </Button>
            </div>
            {stats.unusedReferrals === 0 && (
              <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                <Info className="size-4" />
                {t("unlock.noCreditsHint")}
              </div>
            )}
          </div>

          {/* Rules Section */}
          <GlassPanel className="p-6 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white">
              {t("rules.title")}
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <div className="mt-1 size-1.5 rounded-full bg-blue-500 shrink-0" />
                {t("rules.item1")}
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 size-1.5 rounded-full bg-blue-500 shrink-0" />
                {t("rules.item2")}
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 size-1.5 rounded-full bg-blue-500 shrink-0" />
                {t("rules.item3")}
              </li>
            </ul>
          </GlassPanel>
        </div>

        {/* Right Column: Recent Activity (Placeholder for now) */}
        <div className="space-y-6">
          {/* Can add list of referred users here later if needed */}
        </div>
      </div>

      <UnlockBankModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        banks={banks}
        credits={stats.unusedReferrals}
      />
    </div>
  );
}
