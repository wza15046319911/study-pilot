"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { 
  Library, 
  ChevronRight, 
  Trophy, 
  Clock, 
  Search
} from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Subject } from "@/types/database";

interface UserQuestionBanksClientProps {
  initialData: Array<{
    id: number;
    bank_id: number;
    added_at: string;
    completion_count: number;
    last_completed_at: string | null;
    question_banks: {
      id: number;
      title: string;
      slug: string | null;
      subjects: Subject;
    };
  }>;
}

export function UserQuestionBanksClient({ initialData }: UserQuestionBanksClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const filteredData = useMemo(() => {
    const normalizedSearch = deferredSearchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return initialData;
    }

    return initialData.filter(
      (item) =>
        item.question_banks.title.toLowerCase().includes(normalizedSearch) ||
        item.question_banks.subjects?.name
          .toLowerCase()
          .includes(normalizedSearch),
    );
  }, [initialData, deferredSearchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search question banks..."
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredData.length} of {initialData.length} banks
        </div>
      </div>

      {filteredData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((item) => (
            <Link
              key={item.id}
              href={`/question-banks/${item.question_banks.slug || item.bank_id}`}
              className="group relative flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                  {item.question_banks.subjects?.name || "General"}
                </span>
                <div className="p-2 rounded-full bg-gray-50 dark:bg-gray-800 group-hover:bg-violet-50 dark:group-hover:bg-violet-900/20 transition-colors">
                   <ChevronRight className="size-4 text-gray-400 group-hover:text-violet-500 transition-colors" />
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
                {item.question_banks.title}
              </h3>
              
              <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1.5">
                  <Trophy className="size-3.5 text-amber-500" />
                  <span>{item.completion_count} completed</span>
                </div>
                {item.last_completed_at && (
                  <div className="flex items-center gap-1.5" title={new Date(item.last_completed_at).toLocaleString()}>
                    <Clock className="size-3.5" />
                    <span>
                      {formatDistanceToNow(new Date(item.last_completed_at), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50">
          <Library className="size-12 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No question banks found
          </h3>
          <p className="text-gray-500 max-w-sm mb-6">
            {searchTerm 
              ? "Try adjusting your search terms to find what you're looking for."
              : "You haven't added any question banks to your collection yet."}
          </p>
          {!searchTerm && (
            <Link
              href="/library"
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
            >
              Browse Library
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
