"use client";

import { SubjectGrid } from "./SubjectGrid";
import { Sparkles } from "lucide-react";

interface LibraryContentProps {
  subjects: any[];
  groupedBanks: Record<string, any[]>;
  groupedExams: Record<string, any[]>;
  isVip: boolean;
  unlockedBankIds: Set<number>;
}

export function LibraryContent({
  subjects,
  groupedBanks,
  groupedExams,
}: LibraryContentProps) {
  // Pre-calculate counts for the grid
  const bankCounts: Record<number, number> = {};
  const examCounts: Record<number, number> = {};

  subjects.forEach((subject) => {
    bankCounts[subject.id] = (groupedBanks[subject.id] || []).length;
    examCounts[subject.id] = (groupedExams[subject.id] || []).length;
  });

  return (
    <div className="space-y-16 py-12">
      {/* Hero / Header Section */}
      <div className="text-center max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700">
          <Sparkles className="size-4" />
          <span>Your Learning Hub</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Library
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-light">
          Select a subject to access practice questions, mock exams, and study
          resources.
        </p>
      </div>

      {/* Main Grid */}
      <div>
        <SubjectGrid
          subjects={subjects}
          bankCounts={bankCounts}
          examCounts={examCounts}
        />
      </div>
    </div>
  );
}
