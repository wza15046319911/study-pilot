"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  Calendar,
  ChevronRight,
  Sparkles,
  Target,
  Trophy,
  ArrowUpRight,
} from "lucide-react";

type WeeklyPracticeItem = {
  id: number;
  title: string;
  slug: string | null;
  description: string | null;
  week_start: string | null;
  subject: {
    name: string;
    slug: string | null;
  } | null;
  items?: { count: number }[] | null;
  latestSubmission?: {
    submitted_at: string;
    answered_count: number;
    correct_count: number;
    total_count: number;
  } | null;
};

interface UserWeeklyPracticeClientProps {
  initialData: WeeklyPracticeItem[];
  showSummary?: boolean;
}

const formatWeek = (weekStart: string | null) => {
  if (!weekStart) return "Week not set";
  const date = new Date(weekStart);
  if (Number.isNaN(date.getTime())) return "Week not set";
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
  }).format(date);
};

export function UserWeeklyPracticeClient({
  initialData,
  showSummary = true,
}: UserWeeklyPracticeClientProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const summary = useMemo(() => {
    let totalCompleted = 0;
    let totalAnswered = 0;
    let totalCorrect = 0;

    initialData.forEach((practice) => {
      const submission = practice.latestSubmission;
      if (submission) {
        totalCompleted += 1;
        totalAnswered += submission.answered_count;
        totalCorrect += submission.correct_count;
      }
    });

    const accuracy =
      totalAnswered > 0
        ? Math.round((totalCorrect / totalAnswered) * 100)
        : 0;

    return { totalCompleted, totalAnswered, accuracy };
  }, [initialData]);

  const filtered = useMemo(() => {
    return initialData.filter((practice) => {
      const subjectName = practice.subject?.name || "";
      const matchesQuery =
        practice.title.toLowerCase().includes(query.toLowerCase()) ||
        subjectName.toLowerCase().includes(query.toLowerCase());
      if (!matchesQuery) return false;
      if (filter === "all") return true;
      if (filter === "completed") return Boolean(practice.latestSubmission);
      if (filter === "pending") return !practice.latestSubmission;
      return true;
    });
  }, [initialData, query, filter]);

  return (
    <div className="space-y-6">
      {showSummary ? (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Trophy className="size-4" />
              Completed Weeks
            </div>
            <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {summary.totalCompleted}
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Target className="size-4" />
              Questions Answered
            </div>
            <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {summary.totalAnswered}
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 text-white p-5">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Sparkles className="size-4" />
              Accuracy
            </div>
            <div className="mt-2 text-3xl font-bold">{summary.accuracy}%</div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2 w-full md:w-96">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search weekly practice..."
            className="border-none bg-transparent focus:ring-0 focus:outline-none"
          />
        </div>

        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="md:w-56"
          options={[
            { value: "all", label: "All weeks" },
            { value: "completed", label: "Completed" },
            { value: "pending", label: "Pending" },
          ]}
          placeholder="Filter"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          No weekly practice sets match your filters.
        </div>
      ) : (
        <div className="grid gap-6">
          {filtered.map((practice) => {
            const totalQuestions = practice.items?.[0]?.count || 0;
            const submission = practice.latestSubmission;
            const answeredCount = submission?.answered_count || 0;
            const progressPercent =
              totalQuestions > 0
                ? Math.min(
                    100,
                    Math.round((answeredCount / totalQuestions) * 100)
                  )
                : 0;

            return (
              <div
                key={practice.id}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                        <Calendar className="size-3" />
                        {formatWeek(practice.week_start)}
                      </span>
                      {practice.subject?.name && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {practice.subject.name}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          submission
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        }`}
                      >
                        {submission ? "Completed" : "Not started"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {practice.title}
                      </h3>
                      <p className="mt-2 text-slate-600 dark:text-slate-400">
                        {practice.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          Progress: {answeredCount}/{totalQuestions} answered
                        </span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {submission && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Last submitted:{" "}
                        {new Intl.DateTimeFormat("en-AU", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(submission.submitted_at))}{" "}
                        · Score {submission.correct_count}/
                        {submission.total_count}
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-end">
                    {practice.slug && (
                      <Link
                        href={`/weekly-practice/${practice.slug}/practice`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                      >
                        Start Session
                        <ArrowUpRight className="size-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
