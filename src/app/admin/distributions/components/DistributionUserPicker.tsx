"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Check, Crown, Loader2, User, Users, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { getDistributionUsersPage } from "@/lib/actions/distribution";
import { UserLite, UsersPageResult } from "./types";

interface DistributionUserPickerProps {
  selectedUsers: UserLite[];
  onChange: (users: UserLite[]) => void;
}

const INITIAL_PAGE: UsersPageResult = {
  users: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
};

export function DistributionUserPicker({
  selectedUsers,
  onChange,
}: DistributionUserPickerProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<UsersPageResult>(INITIAL_PAGE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const selectedUserIds = useMemo(
    () => new Set(selectedUsers.map((item) => item.id)),
    [selectedUsers],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const loadPage = async (nextPage: number, searchText: string) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const data = (await getDistributionUsersPage({
        page: nextPage,
        limit: 20,
        query: searchText,
      })) as UsersPageResult;

      if (requestId !== requestIdRef.current) return;
      setResult(data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadPage(page, debouncedQuery);
  }, [page, debouncedQuery]);

  const toggleUser = (user: UserLite) => {
    if (selectedUserIds.has(user.id)) {
      onChange(selectedUsers.filter((item) => item.id !== user.id));
      return;
    }
    onChange([...selectedUsers, user]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold dark:text-gray-300">Add Users</label>
        <div className="sticky top-0 rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
          {selectedUsers.length} selected
        </div>
      </div>

      <Input
        placeholder="Search users by username..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <div
              key={user.id}
              className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-sm text-blue-700 dark:text-blue-200"
            >
              <span className="max-w-[180px] truncate">{user.username || "Unknown"}</span>
              <button
                type="button"
                onClick={() => toggleUser(user)}
                className="rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800"
                aria-label={`Remove ${user.username || "user"}`}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border dark:border-gray-700 overflow-hidden">
        <div className="max-h-72 overflow-y-auto" aria-live="polite">
          {loading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4" />
                {error}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => void loadPage(page, debouncedQuery)}
              >
                Retry
              </Button>
            </div>
          ) : result.users.length === 0 ? (
            <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
              {debouncedQuery
                ? "No users found. Try another keyword."
                : "No users on this page."}
            </div>
          ) : (
            result.users.map((user) => {
              const selected = selectedUserIds.has(user.id);
              return (
                <button
                  type="button"
                  key={user.id}
                  className={cn(
                    "w-full border-b last:border-b-0 dark:border-gray-700 px-3 py-2 text-left transition-colors",
                    selected
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/80",
                  )}
                  onClick={() => toggleUser(user)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {user.avatar_url ? (
                        <div
                          className="size-9 rounded-full bg-cover bg-center"
                          style={{ backgroundImage: `url("${user.avatar_url}")` }}
                        />
                      ) : (
                        <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <User className="size-4 text-slate-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium dark:text-white">
                          {user.username || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {user.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                          user.is_vip
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/35 dark:text-amber-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                        )}
                      >
                        {user.is_vip ? <Crown className="size-3" /> : <Users className="size-3" />}
                        {user.is_vip ? "VIP" : "Free"}
                      </span>
                      {selected && (
                        <span className="inline-flex size-5 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Check className="size-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {result.total} users
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || result.page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-slate-500 dark:text-slate-400 min-w-[90px] text-center">
            Page {result.page} / {result.totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || result.page >= result.totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="size-3 animate-spin" />
          Loading users...
        </div>
      )}
    </div>
  );
}
