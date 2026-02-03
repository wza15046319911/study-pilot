"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Edit2, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
import { deleteWeeklyPractice } from "./actions";

interface WeeklyPracticeRow {
  id: number;
  title: string;
  description: string | null;
  week_start: string | null;
  is_published: boolean;
  subject: { name: string } | null;
  items?: { count: number }[] | null;
}

interface WeeklyPracticeClientProps {
  practices: WeeklyPracticeRow[];
}

const formatWeekStart = (weekStart: string | null) => {
  if (!weekStart) return "No week set";
  const date = new Date(weekStart);
  if (Number.isNaN(date.getTime())) return "No week set";
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
  }).format(date);
};

export function WeeklyPracticeClient({ practices }: WeeklyPracticeClientProps) {
  const router = useRouter();
  const [practiceToDelete, setPracticeToDelete] =
    useState<WeeklyPracticeRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const executeDelete = async () => {
    if (!practiceToDelete) return;
    setIsDeleting(true);
    try {
      await deleteWeeklyPractice(practiceToDelete.id);
      router.refresh();
      setPracticeToDelete(null);
    } catch (error) {
      alert(
        "Failed to delete weekly practice: " +
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
                  Week
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                  Questions
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
              {!practices || practices.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No weekly practice sets yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                practices.map((practice) => {
                  const questionCount = practice.items?.[0]?.count || 0;
                  return (
                    <tr
                      key={practice.id}
                      className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {practice.title}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-[300px]">
                          {practice.description || "No description"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {practice.subject?.name || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <Calendar className="size-3" />
                          {formatWeekStart(practice.week_start)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                        {questionCount} questions
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            practice.is_published
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {practice.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/weekly-practice/${practice.id}`}>
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
                            onClick={() => setPracticeToDelete(practice)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog
        open={!!practiceToDelete}
        onOpenChange={(open) => !open && setPracticeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this weekly practice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-slate-900 dark:text-white">
                {practiceToDelete?.title}
              </span>{" "}
              and remove all associated items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
