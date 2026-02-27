"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Check,
  GraduationCap,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { getDistributionTargetsPage } from "@/lib/actions/distribution";
import { TargetOption, TargetsPageResult } from "./types";

interface DistributionTargetPickerProps {
  targetType: "question_bank" | "exam";
  selectedTarget: TargetOption | null;
  onTargetTypeChange: (nextType: "question_bank" | "exam") => void;
  onSelectedTargetChange: (target: TargetOption | null) => void;
}

const INITIAL_PAGE: TargetsPageResult = {
  targets: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

export function DistributionTargetPicker({
  targetType,
  selectedTarget,
  onTargetTypeChange,
  onSelectedTargetChange,
}: DistributionTargetPickerProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<TargetsPageResult>(INITIAL_PAGE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setQuery("");
    setDebouncedQuery("");
    setPage(1);
  }, [targetType]);

  const loadPage = async (nextPage: number, searchText: string) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const data = (await getDistributionTargetsPage({
        targetType,
        page: nextPage,
        limit: 10,
        query: searchText,
      })) as TargetsPageResult;

      if (requestId !== requestIdRef.current) return;
      setResult(data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load targets.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadPage(page, debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetType, page, debouncedQuery]);

  return (
    <div className="space-y-4">
      <label className="text-sm font-semibold dark:text-gray-300">Target Type</label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onTargetTypeChange("question_bank")}
          className={cn(
            "rounded-xl border px-4 py-3 text-sm font-semibold transition-colors",
            targetType === "question_bank"
              ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/25 dark:text-blue-200"
              : "border-gray-200 dark:border-gray-700 hover:border-blue-300",
          )}
        >
          <span className="inline-flex items-center gap-2">
            <BookOpen className="size-4" />
            Question Bank
          </span>
        </button>
        <button
          type="button"
          onClick={() => onTargetTypeChange("exam")}
          className={cn(
            "rounded-xl border px-4 py-3 text-sm font-semibold transition-colors",
            targetType === "exam"
              ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/25 dark:text-blue-200"
              : "border-gray-200 dark:border-gray-700 hover:border-blue-300",
          )}
        >
          <span className="inline-flex items-center gap-2">
            <GraduationCap className="size-4" />
            Mock Exam
          </span>
        </button>
      </div>

      <label className="text-sm font-semibold dark:text-gray-300">
        Select {targetType === "question_bank" ? "Question Bank" : "Mock Exam"}
      </label>

      {selectedTarget ? (
        <div className="flex items-center justify-between rounded-xl border border-blue-300 bg-blue-50/60 dark:border-blue-700 dark:bg-blue-900/20 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold dark:text-white">
              {selectedTarget.title}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedTarget.type === "question_bank" ? "Question Bank" : "Mock Exam"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelectedTargetChange(null)}
            aria-label="Clear selected target"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Input
            placeholder={`Search ${
              targetType === "question_bank" ? "question banks" : "mock exams"
            }...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<Search className="size-4" />}
          />

          <div className="rounded-xl border dark:border-gray-700 overflow-hidden">
            <div className="max-h-64 overflow-y-auto" aria-live="polite">
              {loading ? (
                <div className="space-y-2 p-3">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : error ? (
                <div className="p-4 text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/20">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-4" />
                    {error}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => void loadPage(page, debouncedQuery)}
                  >
                    Retry
                  </Button>
                </div>
              ) : result.targets.length === 0 ? (
                <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
                  {debouncedQuery
                    ? "No targets found. Try another keyword."
                    : "No targets on this page."}
                </div>
              ) : (
                result.targets.map((target) => (
                  <button
                    type="button"
                    key={`${target.type}-${target.id}`}
                    onClick={() => onSelectedTargetChange(target)}
                    className="w-full border-b last:border-b-0 dark:border-gray-700 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium dark:text-white">
                        {target.title}
                      </p>
                      <span className="inline-flex size-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                        <Check className="size-3" />
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {result.total} total
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || result.page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-slate-500 dark:text-slate-400 min-w-[90px] text-center">
                Page {result.page} / {result.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || result.page >= result.totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="size-3 animate-spin" />
              Loading targets...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
