"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  GraduationCap, 
  ChevronRight, 
  Trophy, 
  Clock, 
  Target,
  Search
} from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Subject } from "@/types/database";
import { slugOrEncodedId } from "@/lib/ids";

interface UserMockExamsClientProps {
  initialData: Array<{
    id: number;
    exam_id: number;
    added_at: string;
    completion_count: number;
    best_score: number | null;
    best_time_seconds: number | null;
    last_attempted_at: string | null;
    exams: {
      id: number;
      subject_id: number;
      title: string;
      slug: string | null;
      duration_minutes: number;
      subjects: Subject;
    };
  }>;
}

export function UserMockExamsClient({ initialData }: UserMockExamsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const filteredData = useMemo(() => {
    const normalizedSearch = deferredSearchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return initialData;
    }

    return initialData.filter(
      (item) =>
        item.exams.title.toLowerCase().includes(normalizedSearch) ||
        item.exams.subjects?.name.toLowerCase().includes(normalizedSearch),
    );
  }, [initialData, deferredSearchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search mock exams..."
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredData.length} of {initialData.length} exams
        </div>
      </div>

      {filteredData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((item) => (
            <Link
              key={item.id}
              href={`/practice/${slugOrEncodedId(item.exams.subjects?.slug, item.exams.subjects?.id || item.exams.subject_id)}/exam/${slugOrEncodedId(item.exams.slug, item.exam_id)}`}
              className="group relative flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  {item.exams.subjects?.name || "Mock Exam"}
                </span>
                <div className="p-2 rounded-full bg-gray-50 dark:bg-gray-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
                   <ChevronRight className="size-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                {item.exams.title}
              </h3>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                   <Trophy className="size-3.5 text-amber-500" />
                   <span>{item.completion_count} attempts</span>
                </div>
                {item.best_score !== null && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Target className="size-3.5 text-green-500" />
                    <span>Best: {item.best_score}%</span>
                  </div>
                )}
                {item.best_time_seconds !== null && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="size-3.5 text-blue-500" />
                    <span>{Math.floor(item.best_time_seconds / 60)}m best</span>
                  </div>
                )}
              </div>
              
              <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  {item.exams.duration_minutes} mins
                </span>
                {item.last_attempted_at && (
                  <span title={new Date(item.last_attempted_at).toLocaleString()}>
                    Last: {formatDistanceToNow(new Date(item.last_attempted_at), { addSuffix: true })}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50">
          <GraduationCap className="size-12 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No mock exams found
          </h3>
          <p className="text-gray-500 max-w-sm mb-6">
            {searchTerm 
              ? "Try adjusting your search terms to find what you're looking for."
              : "You haven't started any mock exams yet."}
          </p>
          {!searchTerm && (
            <Link
              href="/library"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
            >
              Browse Library
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
