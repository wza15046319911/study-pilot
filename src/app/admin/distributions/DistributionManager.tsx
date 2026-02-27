"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  createDistribution,
  deleteDistribution,
} from "@/lib/actions/distribution";
import { cn } from "@/lib/utils";
import { DistributionTargetPicker } from "./components/DistributionTargetPicker";
import { DistributionUserPicker } from "./components/DistributionUserPicker";
import { TargetOption, UserLite } from "./components/types";

interface Distribution {
  id: number;
  target_type: "question_bank" | "exam";
  target_id: number;
  visibility: "public" | "assigned_only";
  note?: string;
  created_at: string;
  target_name?: string;
  users?: { count: number };
}

export default function DistributionManager({
  initialDistributions,
}: {
  initialDistributions: Distribution[];
}) {
  const router = useRouter();
  const [distributions, setDistributions] = useState(initialDistributions);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  const [targetType, setTargetType] = useState<"question_bank" | "exam">(
    "question_bank",
  );
  const [selectedTarget, setSelectedTarget] = useState<TargetOption | null>(null);
  const [visibility, setVisibility] = useState<"public" | "assigned_only">(
    "public",
  );
  const [selectedUsers, setSelectedUsers] = useState<UserLite[]>([]);
  const [note, setNote] = useState("");

  const handleCreate = async () => {
    if (!selectedTarget || selectedUsers.length === 0) return;
    setLoading(true);
    try {
      await createDistribution(
        selectedTarget.type,
        selectedTarget.id,
        visibility,
        selectedUsers.map((u) => u.id),
        note,
      );
      setIsCreating(false);
      resetForm();
      router.refresh();
    } catch (err) {
      alert("Failed to create distribution: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this distribution?")) return;
    try {
      await deleteDistribution(id);
      setDistributions((prev) => prev.filter((d) => d.id !== id));
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  const resetForm = () => {
    setSelectedTarget(null);
    setSelectedUsers([]);
    setNote("");
    setVisibility("public");
    setTargetType("question_bank");
  };

  if (isCreating) {
    return (
      <div className="space-y-6">
        <GlassPanel className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold dark:text-white">Create New Distribution</h2>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>

          <div className="max-w-3xl space-y-6">
            <DistributionTargetPicker
              targetType={targetType}
              selectedTarget={selectedTarget}
              onTargetTypeChange={(nextType) => {
                setTargetType(nextType);
                setSelectedTarget(null);
              }}
              onSelectedTargetChange={setSelectedTarget}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-300">Visibility Mode</label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose whether this content stays public or is only visible to assigned users.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    visibility === "public"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300",
                  )}
                  onClick={() => setVisibility("public")}
                >
                  <div className="mb-1 flex items-center gap-2 font-medium dark:text-white">
                    <Eye className="size-4" /> Public + Unlock
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Item is visible to everyone, and assigned users are unlocked automatically.
                  </p>
                </button>

                <button
                  type="button"
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    visibility === "assigned_only"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300",
                  )}
                  onClick={() => setVisibility("assigned_only")}
                >
                  <div className="mb-1 flex items-center gap-2 font-medium dark:text-white">
                    <EyeOff className="size-4" /> Private Assignment
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Item stays hidden from public library and is visible only to assigned users.
                  </p>
                </button>
              </div>
            </div>

            <DistributionUserPicker
              selectedUsers={selectedUsers}
              onChange={setSelectedUsers}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-300">Admin Note (Optional)</label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reason for distribution..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!selectedTarget || selectedUsers.length === 0 || loading}
                isLoading={loading}
              >
                Confirm Distribution
              </Button>
            </div>
          </div>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 size-4" />
          New Distribution
        </Button>
      </div>

      <div className="grid gap-4">
        {distributions.length === 0 ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            No distributions found. Create one to get started.
          </div>
        ) : (
          distributions.map((dist) => (
            <GlassPanel key={dist.id} className="flex items-center justify-between p-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-xs font-medium uppercase",
                      dist.target_type === "question_bank"
                        ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
                    )}
                  >
                    {dist.target_type === "question_bank" ? "Bank" : "Exam"}
                  </span>
                  <h3 className="text-lg font-semibold dark:text-white">
                    {dist.target_name || `ID: ${dist.target_id}`}
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    {dist.visibility === "public" ? (
                      <Eye className="size-3" />
                    ) : (
                      <EyeOff className="size-3" />
                    )}
                    {dist.visibility === "public" ? "Public" : "Private"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3" />
                    {dist.users?.count || 0} Users
                  </span>
                  <span>Created: {new Date(dist.created_at).toLocaleDateString()}</span>
                </div>
                {dist.note && (
                  <p className="mt-1 text-sm italic text-gray-600 dark:text-gray-300">
                    &quot;{dist.note}&quot;
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-rose-500 text-rose-600 hover:bg-rose-600 hover:text-white dark:text-rose-400 dark:border-rose-400"
                  onClick={() => handleDelete(dist.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </GlassPanel>
          ))
        )}
      </div>
    </div>
  );
}
