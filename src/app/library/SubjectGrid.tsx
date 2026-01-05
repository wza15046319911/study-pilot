"use client";

import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

interface Subject {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

interface SubjectGridProps {
  subjects: Subject[];
  bankCounts: Record<number, number>;
  examCounts: Record<number, number>;
}

export function SubjectGrid({
  subjects,
  bankCounts,
  examCounts,
}: SubjectGridProps) {
  if (subjects.length === 0) {
    return (
      <div className="text-center py-20">
        <BookOpen className="size-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No subjects found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subjects.map((subject) => {
        const bankCount = bankCounts[subject.id] || 0;
        const examCount = examCounts[subject.id] || 0;

        return (
          <Link
            key={subject.id}
            href={`/library/${subject.slug}`}
            className="group relative bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              {/* Icon and Title */}
              <div className="flex items-center gap-4 mb-4">
                {subject.icon && (
                  <span className="text-4xl">{subject.icon}</span>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {subject.name}
                  </h3>
                </div>
                <ChevronRight className="size-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>

              {/* Description */}
              {subject.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                  {subject.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                {examCount > 0 && (
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {examCount}
                    </span>
                    <span>Mock Exam{examCount !== 1 ? "s" : ""}</span>
                  </div>
                )}
                {bankCount > 0 && (
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {bankCount}
                    </span>
                    <span>Question Bank{bankCount !== 1 ? "s" : ""}</span>
                  </div>
                )}
                {examCount === 0 && bankCount === 0 && (
                  <span className="text-slate-400 dark:text-slate-500">
                    Practice available
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
