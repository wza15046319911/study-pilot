"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Edit2, Trash2, Lock, Globe, Gift, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { deleteQuestionBank } from "./actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";

interface QuestionBank {
  id: number;
  title: string;
  description: string | null;
  subject: { name: string } | null;
  is_premium: boolean;
  is_published: boolean;
  unlock_type: "free" | "premium" | "referral" | "paid";
}

interface QuestionBanksClientProps {
  banks: QuestionBank[];
}

export function QuestionBanksClient({ banks }: QuestionBanksClientProps) {
  const router = useRouter();
  const [bankToDelete, setBankToDelete] = useState<QuestionBank | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const executeDelete = async () => {
    if (!bankToDelete) return;

    setIsDeleting(true);
    try {
      await deleteQuestionBank(bankToDelete.id);
      router.refresh();
      setBankToDelete(null);
    } catch (error) {
      alert(
        "Failed to delete question bank: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                  Title
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                  Subject
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                  Access
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {!banks || banks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No question banks found. Create one to get started.
                  </td>
                </tr>
              ) : (
                banks.map((bank) => (
                  <tr
                    key={bank.id}
                    className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {bank.title}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[300px]">
                        {bank.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {bank.subject?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`flex items-center gap-2 text-xs font-medium ${
                          bank.unlock_type === "premium"
                            ? "text-amber-600 dark:text-amber-400"
                            : bank.unlock_type === "paid"
                            ? "text-blue-600 dark:text-blue-400"
                            : bank.unlock_type === "referral"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {bank.unlock_type === "premium" ? (
                          <>
                            <Lock className="size-3" />
                            Premium
                          </>
                        ) : bank.unlock_type === "paid" ? (
                          <>
                            <DollarSign className="size-3" />
                            Paid
                          </>
                        ) : bank.unlock_type === "referral" ? (
                          <>
                            <Gift className="size-3" />
                            Referral
                          </>
                        ) : (
                          <>
                            <Globe className="size-3" />
                            Free
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          bank.is_published
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {bank.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/question-banks/${bank.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="size-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                          onClick={() => setBankToDelete(bank)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog
        open={!!bankToDelete}
        onOpenChange={(open) => !open && setBankToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the question bank{" "}
              <span className="font-medium text-slate-900 dark:text-white">
                {bankToDelete?.title}
              </span>{" "}
              and remove all associated data (items, unlock records). This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                executeDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white border-transparent shadow-red-500/20"
            >
              {isDeleting ? "Deleting..." : "Delete Bank"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
