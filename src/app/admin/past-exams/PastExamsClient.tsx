"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Edit2, Trash2, Calendar, CheckCircle } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
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
import { deletePastExam } from "./actions";

interface PastExamRow {
  id: number;
  year: number;
  semester: number;
  title: string | null;
  is_published: boolean;
  items?: { count: number }[] | null;
}

interface PastExamsClientProps {
  groupedPastExams: Record<string, PastExamRow[]>;
}

const getSemesterLabel = (semester: number) =>
  semester === 1 ? "上学期" : "下学期";

export function PastExamsClient({ groupedPastExams }: PastExamsClientProps) {
  const router = useRouter();
  const [examToDelete, setExamToDelete] = useState<PastExamRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const executeDelete = async () => {
    if (!examToDelete) return;
    setIsDeleting(true);
    try {
      await deletePastExam(examToDelete.id);
      router.refresh();
      setExamToDelete(null);
    } catch (error) {
      alert(
        "Failed to delete past exam: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {Object.keys(groupedPastExams).length === 0 ? (
        <GlassPanel className="p-12 text-center">
          <Calendar className="size-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-500 mb-2">
            No past exams yet
          </h2>
          <p className="text-gray-400 mb-6">
            Create your first past exam answer key to get started.
          </p>
          <Link href="/admin/past-exams/create">
            <Button>Create Past Exam</Button>
          </Link>
        </GlassPanel>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedPastExams).map(([subjectName, exams]) => (
            <div key={subjectName}>
              <h2 className="text-lg font-semibold text-[#0d121b] dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {subjectName}
                <span className="text-sm font-normal text-gray-400">
                  ({exams.length})
                </span>
              </h2>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {exams.map((exam) => {
                  const questionCount = exam.items?.[0]?.count || 0;
                  return (
                    <div key={exam.id} className="relative group">
                      <Link href={`/admin/past-exams/${exam.id}`}>
                        <GlassPanel className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                          <div className="flex items-start justify-between mb-4">
                            <span className="text-xs font-medium px-2 py-1 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                              {exam.year} · {getSemesterLabel(exam.semester)}
                            </span>
                            {exam.is_published ? (
                              <span className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle className="size-3" /> Published
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">
                                Draft
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-[#0d121b] dark:text-white mb-1">
                            {exam.title || "Past Exam Answer Key"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {questionCount} questions
                          </p>
                        </GlassPanel>
                      </Link>

                      <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        <Link href={`/admin/past-exams/${exam.id}`}>
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
                          onClick={() => setExamToDelete(exam)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!examToDelete}
        onOpenChange={(open) => !open && setExamToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this past exam?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected past exam and all of its
              answers.
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
