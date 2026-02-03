"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Edit2, Trash2, CalendarClock, Users } from "lucide-react";
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
import { deleteHomework } from "./actions";

interface HomeworkRow {
  id: number;
  title: string;
  slug: string | null;
  description: string | null;
  due_at: string | null;
  is_published: boolean;
  subject: { name: string } | null;
  assignments?: { count: number }[] | null;
}

interface HomeworksClientProps {
  homeworks: HomeworkRow[];
}

const formatDueDate = (dueAt: string | null) => {
  if (!dueAt) return "No due date";
  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) return "No due date";
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export function HomeworksClient({ homeworks }: HomeworksClientProps) {
  const router = useRouter();
  const [homeworkToDelete, setHomeworkToDelete] = useState<HomeworkRow | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const executeDelete = async () => {
    if (!homeworkToDelete) return;
    setIsDeleting(true);
    try {
      await deleteHomework(homeworkToDelete.id);
      router.refresh();
      setHomeworkToDelete(null);
    } catch (error) {
      alert(
        "Failed to delete homework: " +
          (error instanceof Error ? error.message : "Unknown error"),
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
                  Due
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                  Assigned
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
              {!homeworks || homeworks.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No homework created yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                homeworks.map((homework) => {
                  const assignedCount = homework.assignments?.[0]?.count || 0;
                  return (
                    <tr
                      key={homework.id}
                      className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {homework.title}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-[300px]">
                          {homework.description || "No description"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {homework.subject?.name || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <CalendarClock className="size-3" />
                          {formatDueDate(homework.due_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <Users className="size-3" />
                          {assignedCount} users
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            homework.is_published
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {homework.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/homework/${
                              homework.slug || homework.id
                            }`}
                          >
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
                            onClick={() => setHomeworkToDelete(homework)}
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
        open={!!homeworkToDelete}
        onOpenChange={(open) => !open && setHomeworkToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this homework?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-slate-900 dark:text-white">
                {homeworkToDelete?.title}
              </span>{" "}
              and remove all associated items and assignments.
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
