"use client";

import { useState, useEffect, useCallback } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Search, Loader2, Crown, Shield, Edit } from "lucide-react";
import { getUsers, UserFilters } from "@/lib/actions/adminUser";
import { Profile } from "@/types/database";
import UserEditModal from "./UserEditModal";

interface UserWithEmail extends Profile {
  email: string | null;
}

export default function UsersClient() {
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState(""); // For the input field before pressing enter/search
  const [filters, setFilters] = useState<UserFilters>({
    role: "all",
    vipStatus: "all",
  });

  const [selectedUser, setSelectedUser] = useState<UserWithEmail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const limit = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers(page, limit, searchQuery, filters);
      setUsers(data.users as UserWithEmail[]);
      setTotal(data.total);
      setTotalPages(data.pages);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
    setLoading(false);
  }, [page, limit, searchQuery, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleEdit = (user: UserWithEmail) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <GlassPanel className="p-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search by username..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="size-4" />
          </Button>
        </div>
        <div className="flex gap-4">
          <Select
            value={filters.role || "all"}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            options={[
              { label: "All Roles", value: "all" },
              { label: "Admins", value: "admin" },
              { label: "Regular Users", value: "regular" },
            ]}
          />
          <Select
            value={filters.vipStatus || "all"}
            onChange={(e) => handleFilterChange("vipStatus", e.target.value)}
            options={[
              { label: "All Status", value: "all" },
              { label: "VIP", value: "vip" },
              { label: "Non-VIP", value: "non-vip" },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
              <th className="py-3 px-4 font-medium">User</th>
              <th className="py-3 px-4 font-medium">Email</th>
              <th className="py-3 px-4 font-medium">Level / Streak</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Registered</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center">
                  <Loader2 className="size-6 animate-spin mx-auto text-slate-400" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <div
                          className="size-8 rounded-full bg-cover bg-center shrink-0"
                          style={{ backgroundImage: `url("${user.avatar_url}")` }}
                        />
                      ) : (
                        <div className="size-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                          {user.username?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {user.username || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-400 font-mono truncate max-w-[120px]" title={user.id}>
                          {user.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {user.email || <span className="text-slate-400 italic">Hidden</span>}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-600 dark:text-slate-300">
                      Lv.{user.level} <span className="text-slate-300 dark:text-slate-600 mx-1">|</span> {user.streak_days}🔥
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {user.is_admin && (
                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded text-xs font-medium">
                          <Shield className="size-3" />
                          Admin
                        </span>
                      )}
                      {user.is_vip && (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded text-xs font-medium">
                          <Crown className="size-3" />
                          VIP
                        </span>
                      )}
                      {!user.is_admin && !user.is_vip && (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Intl.DateTimeFormat(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }).format(new Date(user.created_at))}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Edit className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} users
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <div className="flex items-center px-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {selectedUser && (
        <UserEditModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onUpdated={() => {
            fetchUsers();
          }}
        />
      )}
    </GlassPanel>
  );
}
