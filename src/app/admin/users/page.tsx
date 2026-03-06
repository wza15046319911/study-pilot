import { getUserStats } from "@/lib/actions/adminUser";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Users, Crown, Shield, UserPlus } from "lucide-react";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const stats = await getUserStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white mb-2 flex items-center gap-3">
          <Users className="size-8 text-indigo-500" />
          User Management
        </h1>
        <p className="text-[#4c669a]">
          Manage user accounts, roles, and VIP status.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassPanel className="p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="size-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total Users
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.totalUsers}
              </p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Crown className="size-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                VIP Users
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.vipUsers}
              </p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Shield className="size-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Admin Users
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.adminUsers}
              </p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <UserPlus className="size-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                New Today
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.newUsersToday}
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>

      <UsersClient />
    </div>
  );
}
