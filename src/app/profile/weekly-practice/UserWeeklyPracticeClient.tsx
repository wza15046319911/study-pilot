"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { WeeklyPracticeCard } from "@/components/weekly-practice/WeeklyPracticeCard";
import {
  getWeeklyPracticeTotalQuestions,
  isWeeklyPracticeFullyCompleted,
  type WeeklyPracticeSummaryItem,
} from "@/components/weekly-practice/shared";
import {
  getStudyWeekFilterOptions,
  getWeekStartDateKey,
  resolveStudyWeekByStartDate,
  type StudyWeekCode,
} from "@/lib/weekly-practice-weeks";
import { Sparkles, Target, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

interface UserWeeklyPracticeClientProps {
  initialData: WeeklyPracticeSummaryItem[];
  showSummary?: boolean;
}

export function UserWeeklyPracticeClient({
  initialData,
  showSummary = true,
}: UserWeeklyPracticeClientProps) {
  const t = useTranslations("profileWeeklyPractice");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [weekFilter, setWeekFilter] = useState<"all-weeks" | StudyWeekCode>(
    "all-weeks",
  );

  const weekFilterOptions = useMemo(() => getStudyWeekFilterOptions(), []);

  const summary = useMemo(() => {
    let totalCompleted = 0;
    let totalAnswered = 0;
    let totalCorrect = 0;

    initialData.forEach((practice) => {
      const submission = practice.latestSubmission;
      const totalQuestions = getWeeklyPracticeTotalQuestions(practice);
      if (submission) {
        if (isWeeklyPracticeFullyCompleted(submission, totalQuestions)) {
          totalCompleted += 1;
        }
        totalAnswered += submission.answered_count;
        totalCorrect += submission.correct_count;
      }
    });

    const accuracy =
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    return { totalCompleted, totalAnswered, accuracy };
  }, [initialData]);

  const filteredAndSorted = useMemo(() => {
    const practicesWithWeek = initialData.map((practice) => ({
      ...practice,
      resolvedWeek: resolveStudyWeekByStartDate(practice.week_start),
    }));

    return practicesWithWeek
      .filter((practice) => {
        const subjectName = practice.subject?.name || "";
        const matchesQuery =
          practice.title.toLowerCase().includes(query.toLowerCase()) ||
          subjectName.toLowerCase().includes(query.toLowerCase());
        if (!matchesQuery) return false;

        if (filter === "all") return true;
        const submission = practice.latestSubmission;
        const totalQuestions = getWeeklyPracticeTotalQuestions(practice);
        const completed = isWeeklyPracticeFullyCompleted(
          submission,
          totalQuestions,
        );
        const matchesStatusFilter =
          filter === "completed"
            ? completed
            : filter === "pending"
              ? !completed
              : true;
        if (!matchesStatusFilter) return false;

        if (weekFilter === "all-weeks") return true;
        return practice.resolvedWeek.code === weekFilter;
      })
      .sort((a, b) => {
        const byStudyWeekOrder = a.resolvedWeek.order - b.resolvedWeek.order;
        if (byStudyWeekOrder !== 0) return byStudyWeekOrder;

        const aDateKey = getWeekStartDateKey(a.week_start) || 0;
        const bDateKey = getWeekStartDateKey(b.week_start) || 0;
        if (aDateKey !== bDateKey) return bDateKey - aDateKey;

        return a.title.localeCompare(b.title);
      });
  }, [initialData, query, filter, weekFilter]);

  return (
    <div className="space-y-6">
      {showSummary ? (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Trophy className="size-4" />
              {t("summary.completedWeeks")}
            </div>
            <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {summary.totalCompleted}
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Target className="size-4" />
              {t("summary.questionsAnswered")}
            </div>
            <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {summary.totalAnswered}
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 text-white p-5">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Sparkles className="size-4" />
              {t("summary.accuracy")}
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
            placeholder={t("searchPlaceholder")}
            className="border-none bg-transparent focus:ring-0 focus:outline-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="md:w-44"
            options={[
              { value: "all", label: t("filters.allStatus") },
              { value: "completed", label: t("filters.completed") },
              { value: "pending", label: t("filters.pending") },
            ]}
            placeholder={t("filters.status")}
          />
          <Select
            value={weekFilter}
            onChange={(e) =>
              setWeekFilter(e.target.value as "all-weeks" | StudyWeekCode)
            }
            className="md:w-56"
            options={weekFilterOptions}
            placeholder={t("filters.week")}
          />
        </div>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          {t("empty")}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAndSorted.map((practice) => (
            <WeeklyPracticeCard key={practice.id} practice={practice} />
          ))}
        </div>
      )}
    </div>
  );
}
