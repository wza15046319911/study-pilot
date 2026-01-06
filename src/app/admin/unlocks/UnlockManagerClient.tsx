"use client";

import { useState, useTransition } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  Search,
  LockOpen,
  Lock,
  Trash2,
  Plus,
  Loader2,
  UserPlus,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  searchUsers,
  getUserUnlocksAdmin,
  grantBankAccess,
  revokeBankAccess,
  getReferralBanksAdmin,
} from "@/lib/actions/adminUnlock";

interface User {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

interface Unlock {
  id: number;
  bank_id: number;
  unlock_type: string;
  created_at: string;
  bank: { id: number; title: string; slug: string } | null;
}

interface Bank {
  id: number;
  title: string;
  slug: string;
}

export default function UnlockManagerClient() {
  const [isPending, startTransition] = useTransition();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  // Selected user state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userUnlocks, setUserUnlocks] = useState<Unlock[]>([]);
  const [loadingUnlocks, setLoadingUnlocks] = useState(false);

  // Grant access state
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [granting, setGranting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    }
    setSearching(false);
  };

  const selectUser = async (user: User) => {
    setSelectedUser(user);
    setSearchResults([]);
    setSearchQuery("");
    setMessage(null);
    setLoadingUnlocks(true);

    try {
      const [unlocks, bankList] = await Promise.all([
        getUserUnlocksAdmin(user.id),
        getReferralBanksAdmin(),
      ]);
      setUserUnlocks(unlocks);
      setBanks(bankList);
    } catch (e) {
      console.error(e);
    }
    setLoadingUnlocks(false);
  };

  const handleGrantAccess = async () => {
    if (!selectedUser || !selectedBankId) return;
    setGranting(true);
    setMessage(null);

    try {
      const result = await grantBankAccess(
        selectedUser.id,
        parseInt(selectedBankId)
      );
      if (result.success) {
        setMessage({ type: "success", text: "Access granted successfully!" });
        // Refresh unlocks
        const unlocks = await getUserUnlocksAdmin(selectedUser.id);
        setUserUnlocks(unlocks);
        setSelectedBankId("");
      } else {
        setMessage({
          type: "error",
          text: result.message || "Failed to grant access",
        });
      }
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Failed to grant access",
      });
    }
    setGranting(false);
  };

  const handleRevokeAccess = async (unlockId: number) => {
    if (!confirm("Are you sure you want to revoke this access?")) return;

    startTransition(async () => {
      try {
        await revokeBankAccess(unlockId);
        if (selectedUser) {
          const unlocks = await getUserUnlocksAdmin(selectedUser.id);
          setUserUnlocks(unlocks);
        }
        setMessage({ type: "success", text: "Access revoked" });
      } catch (e) {
        setMessage({ type: "error", text: "Failed to revoke access" });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* User Search */}
      <GlassPanel className="p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Search className="size-5" />
          Find User
        </h2>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by username..."
              className="pr-10"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={searching || searchQuery.length < 2}
          >
            {searching ? <Loader2 className="size-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2 border-t pt-4 border-slate-200 dark:border-slate-700">
            {searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => selectUser(user)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
              >
                {user.avatar_url ? (
                  <div
                    className="size-10 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url("${user.avatar_url}")` }}
                  />
                ) : (
                  <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {user.username?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {user.username || "Unknown"}
                  </p>
                  <p className="text-xs text-slate-500">{user.id}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </GlassPanel>

      {/* Selected User Panel */}
      {selectedUser && (
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {selectedUser.avatar_url ? (
                <div
                  className="size-14 rounded-full bg-cover bg-center border-2 border-white shadow"
                  style={{
                    backgroundImage: `url("${selectedUser.avatar_url}")`,
                  }}
                />
              ) : (
                <div className="size-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow">
                  {selectedUser.username?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedUser.username || "Unknown User"}
                </h3>
                <p className="text-sm text-slate-500">{selectedUser.id}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setSelectedUser(null)}>
              Clear
            </Button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {message.type === "success" ? (
                <Check className="size-4" />
              ) : (
                <AlertCircle className="size-4" />
              )}
              {message.text}
            </div>
          )}

          {/* Grant Access */}
          <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <h4 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <UserPlus className="size-4 text-blue-500" />
              Grant Bank Access
            </h4>
            <div className="flex gap-3">
              <Select
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                options={banks.map((b) => ({
                  value: b.id.toString(),
                  label: b.title,
                }))}
                placeholder="Select a bank..."
                className="flex-1"
              />
              <Button
                onClick={handleGrantAccess}
                disabled={granting || !selectedBankId}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {granting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4 mr-1" />
                )}
                Grant
              </Button>
            </div>
          </div>

          {/* Current Unlocks */}
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <LockOpen className="size-4 text-green-500" />
              Current Unlocks ({userUnlocks.length})
            </h4>

            {loadingUnlocks ? (
              <div className="py-8 text-center text-slate-400">
                <Loader2 className="size-6 animate-spin mx-auto" />
              </div>
            ) : userUnlocks.length === 0 ? (
              <p className="py-8 text-center text-slate-400 text-sm">
                No unlocked banks
              </p>
            ) : (
              <div className="space-y-2">
                {userUnlocks.map((unlock) => (
                  <div
                    key={unlock.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {unlock.bank?.title || "Unknown Bank"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            unlock.unlock_type === "admin"
                              ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30"
                              : unlock.unlock_type === "referral"
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-700"
                          }`}
                        >
                          {unlock.unlock_type}
                        </span>
                        <span>
                          {new Date(unlock.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeAccess(unlock.id)}
                      disabled={isPending}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
