"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Plus, FileText, Clock, CheckCircle, Trash2 } from "lucide-react";
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
import { deleteExam } from "./actions";
import { slugOrEncodedId } from "@/lib/ids";

interface Exam {
  id: number;
  title: string;
  slug: string;
  exam_type: string;
  duration_minutes: number;
  is_published: boolean;
  created_at: string;
  subjects: {
    id: number;
    name: string;
  };
}

interface ExamsClientProps {
  groupedExams: Record<string, Exam[]>;
}

export function ExamsClient({ groupedExams }: ExamsClientProps) {
  const router = useRouter();
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const executeDelete = async () => {
    if (!examToDelete) return;

    setIsDeleting(true);
    try {
      await deleteExam(examToDelete.id);
      router.refresh();
      setExamToDelete(null);
    } catch (error) {
      alert(
        "Failed to delete exam: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white">
            Exam Management
          </h1>
          <p className="text-[#4c669a]">Create and manage mock exams</p>
        </div>
        <Link href="/admin/exams/create">
          <Button size="lg">
            <Plus className="size-5 mr-2" />
            Create Exam
          </Button>
        </Link>
      </div>

      {Object.keys(groupedExams).length === 0 ? (
        <GlassPanel className="p-12 text-center">
          <FileText className="size-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-500 mb-2">
            No exams yet
          </h2>
          <p className="text-gray-400 mb-6">
            Create your first exam to get started.
          </p>
          <Link href="/admin/exams/create">
            <Button>Create Exam</Button>
          </Link>
        </GlassPanel>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedExams).map(([subjectName, exams]) => (
            <div key={subjectName}>
              <h2 className="text-lg font-semibold text-[#0d121b] dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#135bec]" />
                {subjectName}
                <span className="text-sm font-normal text-gray-400">
                  ({exams.length})
                </span>
              </h2>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {exams.map((exam) => (
                  <div key={exam.id} className="relative group">
                    <Link href={`/admin/exams/${slugOrEncodedId(exam.slug, exam.id)}`}>
                      <GlassPanel className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded ${
                                exam.exam_type === "midterm"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-purple-100 text-purple-600"
                              }`}
                            >
                              {exam.exam_type.toUpperCase()}
                            </span>
                          </div>
                          {exam.is_published ? (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle className="size-3" />
                              Published
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Draft</span>
                          )}
                        </div>

                        <h3 className="font-bold text-[#0d121b] dark:text-white mb-1 pr-6">
                          {exam.title}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono mb-2">
                          /{exam.slug}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-[#4c669a]">
                          <span className="flex items-center gap-1">
                            <Clock className="size-4" />
                            {Math.floor(exam.duration_minutes / 60)}h{" "}
                            {exam.duration_minutes % 60}m
                          </span>
                        </div>
                      </GlassPanel>
                    </Link>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setExamToDelete(exam);
                      }}
                      className="absolute bottom-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors z-10"
                      title="Delete Exam"
                      aria-label="Delete Exam"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
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
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the exam{" "}
              <span className="font-medium text-slate-900 dark:text-white">
                {examToDelete?.title}
              </span>{" "}
              and remove all associated data (questions, attempts). This action cannot be undone.
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
              {isDeleting ? "Deleting..." : "Delete Exam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
