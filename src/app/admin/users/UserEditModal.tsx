"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, Shield, Crown, AlertCircle, Check, Loader2 } from "lucide-react";
import { updateUserRole, updateUserVip } from "@/lib/actions/adminUser";
import { Profile } from "@/types/database";
import { Switch } from "@/components/ui/Switch";

interface UserWithEmail extends Profile {
  email: string | null;
}

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithEmail;
  onUpdated: () => void;
}

export default function UserEditModal({
  isOpen,
  onClose,
  user,
  onUpdated,
}: UserEditModalProps) {
  const [isAdmin, setIsAdmin] = useState(user.is_admin);
  const [isVip, setIsVip] = useState(user.is_vip);
  const [vipExpiresAt, setVipExpiresAt] = useState(
    user.vip_expires_at ? new Date(user.vip_expires_at).toISOString().slice(0, 16) : ""
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // If role changed
      if (isAdmin !== user.is_admin) {
        if (
          !isAdmin &&
          !confirm("Are you sure you want to remove admin privileges from this user?")
        ) {
          setIsAdmin(true); // Revert
          setSaving(false);
          return;
        }
        await updateUserRole(user.id, isAdmin);
      }

      // If VIP changed
      const currentVipExpiresAt = user.vip_expires_at
        ? new Date(user.vip_expires_at).toISOString().slice(0, 16)
        : "";

      if (isVip !== user.is_vip || (isVip && vipExpiresAt !== currentVipExpiresAt)) {
        await updateUserVip(
          user.id,
          isVip,
          isVip && vipExpiresAt ? new Date(vipExpiresAt).toISOString() : null
        );
      }

      setMessage({ type: "success", text: "User updated successfully." });
      onUpdated();
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update user",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <GlassPanel className="w-full max-w-lg p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="size-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Edit User: {user.username || "Unknown"}
        </h2>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* User Info Readonly */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            {user.avatar_url ? (
              <div
                className="size-16 rounded-full bg-cover bg-center shrink-0 border-2 border-white shadow-sm"
                style={{ backgroundImage: `url("${user.avatar_url}")` }}
              />
            ) : (
              <div className="size-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shrink-0 border-2 border-white shadow-sm">
                {user.username?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {user.username || "No Username"}
              </p>
              <p className="text-sm text-slate-500 truncate">{user.email}</p>
              <p className="text-xs text-slate-400 font-mono mt-1">ID: {user.id}</p>
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {message.type === "success" ? (
                <Check className="size-4 shrink-0" />
              ) : (
                <AlertCircle className="size-4 shrink-0" />
              )}
              {message.text}
            </div>
          )}

          {/* Admin Role */}
          <div className="space-y-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <Shield className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Administrator
                  </h3>
                  <p className="text-xs text-slate-500">
                    Grant full access to admin dashboard
                  </p>
                </div>
              </div>
              <Switch checked={isAdmin} onCheckedChange={setIsAdmin} />
            </div>
          </div>

          {/* VIP Status */}
          <div className="space-y-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <Crown className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    VIP Status
                  </h3>
                  <p className="text-xs text-slate-500">
                    Premium features access
                  </p>
                </div>
              </div>
              <Switch checked={isVip} onCheckedChange={setIsVip} />
            </div>

            {isVip && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  VIP Expiry Date
                </label>
                <Input
                  type="datetime-local"
                  value={vipExpiresAt}
                  onChange={(e) => setVipExpiresAt(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Leave empty for lifetime VIP
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="min-w-[100px]">
            {saving ? <Loader2 className="size-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </GlassPanel>
    </div>
  );
}
