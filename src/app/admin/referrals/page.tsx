import { Suspense } from "react";
import {
  getAdminReferralStats,
  getTopReferrers,
  getBankUnlockStats,
  getRecentReferrals,
} from "@/lib/actions/adminReferral";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Users, Trophy, LockOpen, TrendingUp, Gift, Award } from "lucide-react";
import Link from "next/link";

export default async function AdminReferralsPage() {
  const [stats, topReferrers, bankStats, recentReferrals] = await Promise.all([
    getAdminReferralStats("all"),
    getTopReferrers(10),
    getBankUnlockStats(),
    getRecentReferrals(15),
  ]);

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Gift className="size-8 text-purple-500" />
          Referral Analytics
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Track referral program performance and manage referrals
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <GlassPanel className="p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="size-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total Referrals
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.totalReferrals}
              </p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <LockOpen className="size-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Banks Unlocked
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.totalUnlocks}
              </p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="size-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Conversion Rate
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.conversionRate}%
              </p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Award className="size-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Active Codes
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.totalCodes}
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Referrers Leaderboard */}
        <GlassPanel className="p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="size-5 text-amber-500" />
            Top Referrers
          </h2>
          {topReferrers.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">
              No referrals yet
            </p>
          ) : (
            <div className="space-y-3">
              {topReferrers.map((user, idx) => (
                <div
                  key={user.userId}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                >
                  <span
                    className={`font-bold text-lg w-8 ${
                      idx === 0
                        ? "text-amber-500"
                        : idx === 1
                        ? "text-slate-400"
                        : idx === 2
                        ? "text-amber-700"
                        : "text-slate-500"
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  {user.avatarUrl ? (
                    <div
                      className="size-10 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url("${user.avatarUrl}")` }}
                    />
                  ) : (
                    <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {user.username?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {user.username || "Anonymous"}
                    </p>
                  </div>
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-bold">
                    {user.referralCount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>

        {/* Bank Unlock Stats */}
        <GlassPanel className="p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <LockOpen className="size-5 text-green-500" />
            Unlocks by Bank
          </h2>
          {bankStats.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">
              No unlocks recorded
            </p>
          ) : (
            <div className="space-y-3">
              {bankStats.slice(0, 8).map((bank) => (
                <div
                  key={bank.bankId}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {bank.title}
                    </p>
                    {bank.slug && (
                      <Link
                        href={`/question-banks/${bank.slug}`}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        View Bank →
                      </Link>
                    )}
                  </div>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-bold">
                    {bank.unlockCount} unlocks
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>
      </div>

      {/* Recent Referrals */}
      <GlassPanel className="p-6 mt-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Recent Referrals
        </h2>
        {recentReferrals.length === 0 ? (
          <p className="text-slate-400 text-sm py-8 text-center">
            No referrals yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">
                    Referrer
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">
                    New User
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentReferrals.map((ref: any) => (
                  <tr
                    key={ref.id}
                    className="border-b border-slate-100 dark:border-slate-800"
                  >
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {ref.referrer?.username || "Unknown"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-600 dark:text-slate-300">
                        {ref.referee?.username || "Unknown"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {ref.used_for_unlock ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded text-xs font-medium">
                          <LockOpen className="size-3" />
                          Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded text-xs font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(ref.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>
    </main>
  );
}
