"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { slugOrEncodedId } from "@/lib/ids";
import {
  CalendarClock,
  AlarmClock,
  Flame,
  CheckCircle2,
  Search,
  ListChecks,
  Brain,
  GraduationCap,
} from "lucide-react";

type HomeworkAssignment = {
  id: number;
  assigned_at: string;
  completed_at: string | null;
  latestSubmission?: {
    submitted_at: string;
    answered_count: number;
    correct_count: number;
    total_count: number;
  } | null;
  homework: {
    id: number;
    title: string;
    slug: string | null;
    description: string | null;
    due_at: string | null;
    allowed_modes?: string[] | null;
    items?: { count: number }[] | null;
    subject: {
      name: string;
      slug: string | null;
    } | null;
  };
};

interface UserHomeworkClientProps {
  initialData: HomeworkAssignment[];
}

const modeMap = {
  standard: {
    label: "Standard",
    icon: ListChecks,
    route: "practice",
    className:
      "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400",
  },
  immersive: {
    label: "Immersive",
    icon: Brain,
    route: "immersive",
    className:
      "bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400",
  },
  flashcard: {
    label: "Flashcard",
    icon: GraduationCap,
    route: "flashcards",
    className:
      "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400",
  },
};

const getDaysLeft = (dueAt: string | null) => {
  if (!dueAt) return null;
  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) return null;
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const getStatus = (daysLeft: number | null) => {
  if (daysLeft === null) {
    return {
      label: "No deadline",
      className:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      accent: "border-slate-200 dark:border-slate-700",
      icon: CalendarClock,
    };
  }
  if (daysLeft < 0) {
    return {
      label: "Overdue",
      className:
        "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
      accent: "border-rose-300 dark:border-rose-700",
      icon: Flame,
    };
  }
  if (daysLeft <= 1) {
    return {
      label: "Due in 1 day",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      accent: "border-amber-300 dark:border-amber-700",
      icon: AlarmClock,
    };
  }
  if (daysLeft <= 3) {
    return {
      label: "Due in 3 days",
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      accent: "border-orange-300 dark:border-orange-700",
      icon: AlarmClock,
    };
  }
  if (daysLeft <= 7) {
    return {
      label: "Due in 7 days",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      accent: "border-blue-300 dark:border-blue-700",
      icon: CalendarClock,
    };
  }
  return {
    label: "On track",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    accent: "border-emerald-300 dark:border-emerald-700",
    icon: CheckCircle2,
  };
};

const formatDueDate = (dueAt: string | null) => {
  if (!dueAt) return "No deadline";
  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) return "No deadline";
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getTimeProgress = (assignedAt: string, dueAt: string | null) => {
  if (!dueAt) return null;
  const start = new Date(assignedAt).getTime();
  const end = new Date(dueAt).getTime();
  const now = new Date().getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  const totalDuration = end - start;
  const elapsed = now - start;

  if (totalDuration <= 0) return { percent: 100, color: "bg-red-500" };

  const percent = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

  let color = "bg-emerald-500";
  if (percent > 80) color = "bg-red-500";
  else if (percent > 50) color = "bg-orange-500";

  return { percent, color };
};

export function UserHomeworkClient({ initialData }: UserHomeworkClientProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    return initialData.filter((assignment) => {
      const homework = assignment.homework;
      const subjectName = homework.subject?.name || "";
      const matchesQuery =
        homework.title.toLowerCase().includes(query.toLowerCase()) ||
        subjectName.toLowerCase().includes(query.toLowerCase());
      if (!matchesQuery) return false;

      const daysLeft = getDaysLeft(homework.due_at);
      if (filter === "all") return true;
      if (filter === "overdue") return daysLeft !== null && daysLeft < 0;
      if (filter === "due_1")
        return daysLeft !== null && daysLeft <= 1 && daysLeft >= 0;
      if (filter === "due_3")
        return daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;
      if (filter === "due_7")
        return daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
      return true;
    });
  }, [initialData, query, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2 w-full md:w-96">
          <Search className="size-4 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search homework or subject..."
            className="border-none bg-transparent focus:ring-0 focus:outline-none"
          />
        </div>

        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="md:w-56"
          options={[
            { value: "all", label: "All homework" },
            { value: "due_7", label: "Due in 7 days" },
            { value: "due_3", label: "Due in 3 days" },
            { value: "due_1", label: "Due in 1 day" },
            { value: "overdue", label: "Overdue" },
          ]}
          placeholder="Filter"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          No homework assignments match your filters.
        </div>
      ) : (
        <div className="grid gap-6">
          {filtered.map((assignment) => {
            const homework = assignment.homework;
            const daysLeft = getDaysLeft(homework.due_at);
            const status = getStatus(daysLeft);
            const StatusIcon = status.icon;
            const allowedModes = homework.allowed_modes || [
              "standard",
              "immersive",
              "flashcard",
            ];
            const totalQuestions = homework.items?.[0]?.count || 0;
            const latestSubmission = assignment.latestSubmission;
            const answeredCount = latestSubmission?.answered_count || 0;
            const totalCount = latestSubmission?.total_count || totalQuestions;
            const hasProgress = answeredCount > 0;
            const isCompleted =
              Boolean(assignment.completed_at) ||
              (totalCount > 0 && answeredCount >= totalCount);
            const progressPercent =
              totalCount > 0
                ? Math.min(100, Math.round((answeredCount / totalCount) * 100))
                : 0;
            const completionLabel = isCompleted
              ? "Completed"
              : hasProgress
                ? "In progress"
                : "Not submitted";

            return (
              <div
                key={assignment.id}
                className={`rounded-3xl border ${status.accent} bg-white dark:bg-slate-900 p-6 shadow-sm`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}
                      >
                        <StatusIcon className="size-3" />
                        {status.label}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : hasProgress
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {completionLabel}
                      </span>
                      {homework.subject?.name && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {homework.subject.name}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {homework.title}
                      </h3>
                      <p className="mt-2 text-slate-600 dark:text-slate-400">
                        {homework.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                      <CalendarClock className="size-4" />
                      Due: {formatDueDate(homework.due_at)}
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          Progress: {answeredCount}/
                          {totalCount || totalQuestions} answered
                        </span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Time Progress Bar */}
                    {(() => {
                      const timeProgress = getTimeProgress(
                        assignment.assigned_at,
                        homework.due_at,
                      );
                      if (timeProgress) {
                        return (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                              <span className="flex items-center gap-1.5">
                                <Flame className="size-3 text-orange-500" />
                                Time Elapsed
                              </span>
                              <span>{Math.round(timeProgress.percent)}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full ${timeProgress.color} transition-all duration-300`}
                                style={{
                                  width: `${timeProgress.percent}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    {latestSubmission ? (
                      <span>
                        Last submitted:{" "}
                        {new Intl.DateTimeFormat("en-AU", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(latestSubmission.submitted_at))}{" "}
                        · Score {latestSubmission.correct_count}/
                        {latestSubmission.total_count}
                      </span>
                    ) : (
                      <span>No submission yet.</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
                  {allowedModes.map((mode) => {
                    const config = modeMap[mode as keyof typeof modeMap];
                    if (!config) return null;
                    const Icon = config.icon;
                    const homeworkRouteId = slugOrEncodedId(
                      homework.slug,
                      homework.id,
                    );
                    return (
                      <Link
                        key={mode}
                        href={`/homework/${homeworkRouteId}/${config.route}`}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${config.className}`}
                      >
                        <Icon className="size-3" />
                        {config.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
