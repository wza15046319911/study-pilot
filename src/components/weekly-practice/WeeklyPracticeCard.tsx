"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, Calendar, PlayCircle } from "lucide-react";
import { slugOrEncodedId } from "@/lib/ids";
import { normalizeHttpUrl } from "@/lib/video";
import {
  resolveStudyWeekByStartDate,
  type ResolvedStudyWeek,
} from "@/lib/weekly-practice-weeks";
import { cn } from "@/lib/utils";
import {
  getWeeklyPracticeTotalQuestions,
  isWeeklyPracticeFullyCompleted,
  type WeeklyPracticeSummaryItem,
} from "./shared";

interface WeeklyPracticeCardProps {
  practice: WeeklyPracticeSummaryItem;
  showVideoCta?: boolean;
  className?: string;
}

export function WeeklyPracticeCard({
  practice,
  showVideoCta = true,
  className,
}: WeeklyPracticeCardProps) {
  const t = useTranslations("profileWeeklyPractice");
  const locale = useLocale();
  const submission = practice.latestSubmission;
  const totalQuestions = getWeeklyPracticeTotalQuestions(practice);
  const answeredCount = submission?.answered_count || 0;
  const isCompleted = isWeeklyPracticeFullyCompleted(submission, totalQuestions);
  const resolvedWeek = resolveStudyWeekByStartDate(
    practice.week_start,
  ) as ResolvedStudyWeek;
  const isExpired =
    !isCompleted && resolvedWeek.endDate
      ? new Date(resolvedWeek.endDate + "T23:59:59Z") < new Date()
      : false;
  const isInProgress = Boolean(submission) && !isCompleted;
  const progressPercent =
    totalQuestions > 0
      ? Math.min(100, Math.round((answeredCount / totalQuestions) * 100))
      : 0;
  const weekBadgeText = resolvedWeek.rangeLabel
    ? `${resolvedWeek.label} · ${resolvedWeek.rangeLabel}`
    : resolvedWeek.label;
  const routeId = slugOrEncodedId(practice.slug, practice.id);
  const practiceHref = `/weekly-practice/${routeId}/practice`;
  const videoHref = `/weekly-practice/${routeId}/video`;
  const hasVideo = Boolean(normalizeHttpUrl(practice.video_url));
  const formattedSubmissionDate = submission
    ? new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-AU", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(submission.submitted_at))
    : null;

  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              <Calendar className="size-3" />
              {weekBadgeText}
            </span>
            {practice.subject?.name && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {practice.subject.name}
              </span>
            )}
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                isCompleted
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : isExpired
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                    : isInProgress
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              }`}
            >
              {isCompleted
                ? t("status.completed")
                : isExpired
                  ? t("status.expired")
                  : isInProgress
                    ? t("status.inProgress")
                    : t("status.notStarted")}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {practice.title}
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {practice.description || t("noDescription")}
            </p>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                {t("progress", {
                  answered: answeredCount,
                  total: totalQuestions,
                })}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {submission && formattedSubmissionDate && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t("lastSubmitted")} {formattedSubmissionDate} ·{" "}
              {t("score", {
                correct: submission.correct_count,
                total: submission.total_count,
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
          {showVideoCta && hasVideo && (
            <Link
              href={videoHref}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/60 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
            >
              <PlayCircle className="size-3.5" />
              {t("videoCta")}
            </Link>
          )}
          <Link
            href={practiceHref}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
          >
            {isCompleted
              ? t("cta.review")
              : isInProgress
                ? t("cta.continue")
                : t("cta.start")}
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
