"use client";

import { BookOpen } from "lucide-react";
import Link from "next/link";

interface Subject {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

interface SubjectGridProps {
  subjects: Subject[];
}

export function SubjectGrid({ subjects }: SubjectGridProps) {
  if (subjects.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center size-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
          <BookOpen className="size-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-2">
          Library Empty
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          No subjects found at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Link
            key={subject.id}
            href={`/library/${subject.slug}`}
            className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
              <span className="text-9xl">{subject.icon || "📚"}</span>
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="size-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 text-4xl group-hover:scale-110 transition-transform duration-300">
                {subject.icon || "📚"}
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {subject.name}
              </h3>

              <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4 flex-grow">
                {subject.description ||
                  "Access practice questions and mock exams."}
              </p>

              <div className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                Browse Resources <span className="ml-1">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
