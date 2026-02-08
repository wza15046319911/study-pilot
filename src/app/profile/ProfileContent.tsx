"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Profile, Subject, Mistake, Question } from "@/types/database";
import {
  AlertCircle,
  AlarmClock,
  TrendingUp,
  Users,
  FileText,
  Target,
  Layers,
  BookMarked,
  LogOut,
  Library,
  GraduationCap,
  Clock,
  Trophy,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  CalendarCheck,
  CheckCircle2,
  Upload,
} from "lucide-react";

import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { slugOrEncodedId } from "@/lib/ids";

const DailyTrendChart = dynamic(
  () =>
    import("./analytics/DailyTrendChart").then(
      (module) => module.DailyTrendChart,
    ),
  { ssr: false },
);

const weekDots = Array.from({ length: 7 });

// Combined types for props
interface ProgressWithSubject {
  subjects: Subject;
  total_attempts: number;
  unique_completed: number;
  unique_correct: number;
}

type QuestionSummary = Pick<Question, "title" | "difficulty">;

interface MistakeWithQuestion extends Mistake {
  questions: QuestionSummary;
}

interface BookmarkWithQuestion {
  id: number;
  question_id: number;
  created_at: string;
  questions: QuestionSummary;
}

interface ProfileContentProps {
  user: Profile;
  progress: ProgressWithSubject[];
  mistakes: MistakeWithQuestion[];
  bookmarks: BookmarkWithQuestion[];
  answerStats: {
    total: number;
    correct: number;
    accuracy: number;
  };
  dailyActivity: {
    date: string;
    count: number;
    correct: number;
  }[];
  difficultyStats: {
    level: string;
    total: number;
    correct: number;
    accuracy: number;
  }[];
  referralStats: {
    totalReferrals: number;
    unusedReferrals: number;
    unlockedBanks: number;
  };
  accessibleBanks: Array<{
    id: number;
    title: string;
    slug: string | null;
    subjects: Subject;
    is_premium: boolean;
    unlock_type: "free" | "premium" | "referral" | "paid";
    access_status: "Free" | "Unlocked" | "Premium";
  }>;
  userQuestionBanks: Array<{
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
  userExams: Array<{
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
  homeworkStats?: {
    assigned: number;
    due: number;
    graded: number;
  };
  homeworkPreview?: Array<{
    id: number;
    title: string;
    dueAt: string | null;
    completedAt: string | null;
  }>;
  isAdmin?: boolean;
}

export function ProfileContent({
  user,
  mistakes,
  bookmarks,
  answerStats,
  dailyActivity,
  userQuestionBanks,
  userExams,
  homeworkStats = { assigned: 0, due: 0, graded: 0 },
  homeworkPreview = [],
  isAdmin = false,
}: ProfileContentProps) {
  const [open, setOpen] = useState(false);

  const mistakesStats = useMemo(() => {
    const total = mistakes.length;
    const totalErrors = mistakes.reduce(
      (sum, item) => sum + item.error_count,
      0,
    );
    const hard = mistakes.filter(
      (item) => item.questions?.difficulty === "hard",
    ).length;
    const latestAt = mistakes[0]?.last_error_at || null;

    return { total, totalErrors, hard, latestAt };
  }, [mistakes]);

  const bookmarkStats = useMemo(() => {
    const total = bookmarks.length;
    const hard = bookmarks.filter(
      (item) => item.questions?.difficulty === "hard",
    ).length;
    const medium = bookmarks.filter(
      (item) => item.questions?.difficulty === "medium",
    ).length;
    const easy = bookmarks.filter(
      (item) => item.questions?.difficulty === "easy",
    ).length;
    const latestAt = bookmarks[0]?.created_at || null;

    return { total, hard, medium, easy, latestAt };
  }, [bookmarks]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatHomeworkDueLabel = (dueAt: string | null) => {
    if (!dueAt) return "No deadline";

    const dueDate = new Date(dueAt);
    if (Number.isNaN(dueDate.getTime())) return "No deadline";

    const now = new Date();
    const isToday =
      dueDate.getFullYear() === now.getFullYear() &&
      dueDate.getMonth() === now.getMonth() &&
      dueDate.getDate() === now.getDate();

    const timeLabel = dueDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (isToday) {
      return `Tonight ${timeLabel}`;
    }

    const dayLabel = dueDate.toLocaleDateString("en-US", {
      weekday: "short",
    });

    return `${dayLabel} ${timeLabel}`;
  };

  const homeworkRows = useMemo(
    () =>
      homeworkPreview.map((item) => ({
        id: item.id,
        title: item.title,
        done: !!item.completedAt,
        dueLabel: formatHomeworkDueLabel(item.dueAt),
      })),
    [homeworkPreview],
  );

  const links = [
    {
      label: "Mistakes",
      href: "/profile/mistakes",
      icon: (
        <AlertCircle className="text-neutral-700 dark:text-neutral-200 size-5 flex-shrink-0" />
      ),
    },
    {
      label: "Bookmarks",
      href: "/profile/bookmarks",
      icon: (
        <BookMarked className="text-neutral-700 dark:text-neutral-200 size-5 flex-shrink-0" />
      ),
    },
    {
      label: "Homework",
      href: "/profile/homework",
      icon: (
        <ClipboardCheck className="text-neutral-700 dark:text-neutral-200 size-5 flex-shrink-0" />
      ),
    },
    {
      label: "Weekly Practice",
      href: "/profile/weekly-practice",
      icon: (
        <CalendarCheck className="text-neutral-700 dark:text-neutral-200 size-5 flex-shrink-0" />
      ),
    },
    {
      label: "Referrals",
      href: "/profile/referrals",
      icon: (
        <Users className="text-neutral-700 dark:text-neutral-200 size-5 flex-shrink-0" />
      ),
    },
  ];

  if (isAdmin) {
    links.push({
      label: "Admin Panel",
      href: "/admin",
      icon: (
        <Layers className="text-neutral-700 dark:text-neutral-200 size-5 flex-shrink-0" />
      ),
    });
  }

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-auto min-h-[85vh]", // Fixed height container for sidebar
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col items-center justify-center mb-8 mt-2">
              <div
                className={cn(
                  "rounded-full bg-cover bg-center ring-2 ring-gray-100 dark:ring-gray-700 mb-2 transition-all duration-300",
                  open ? "size-16" : "size-9 mt-1",
                )}
                style={
                  user.avatar_url
                    ? { backgroundImage: `url(${user.avatar_url})` }
                    : undefined
                }
              >
                {!user.avatar_url && (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 font-bold text-xl">
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              {open && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <p className="font-bold text-neutral-800 dark:text-white truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Level {user.level || 1}
                  </p>
                </motion.div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Logout",
                href: "/login",
                icon: (
                  <LogOut className="text-neutral-700 dark:text-neutral-200 size-5 flex-shrink-0" />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex flex-col flex-1 bg-white dark:bg-slate-950 p-4 md:p-8 overflow-y-auto">
        {/* Main Content Area */}
        <div className="max-w-6xl mx-auto w-full">
          {/* Main Layout */}
          <div className="space-y-8">
            {/* 1. TOP CARDS: HOMEWORK & WEEKLY PRACTICE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Homework */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden h-full">
                <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] font-semibold text-amber-600 dark:text-amber-400">
                      Homework
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                      Assigned
                    </h3>
                  </div>
                  <div className="size-14 rounded-full bg-amber-100/80 dark:bg-amber-900/25 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <ClipboardList className="size-7" />
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-950/50 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-200">
                      <AlarmClock className="size-5 text-amber-500 dark:text-amber-400" />
                      <span className="text-sm sm:text-base font-medium">
                        {homeworkStats.due > 0
                          ? `${homeworkStats.due} homework${homeworkStats.due > 1 ? "s" : ""} due this week`
                          : "No homework due this week"}
                      </span>
                    </div>

                    <Link
                      href="/profile/homework"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-bold px-5 py-2.5 transition-colors"
                    >
                      <Upload className="size-4" />
                      Submit
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {homeworkRows.length === 0 ? (
                      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-5 bg-white dark:bg-slate-950/30">
                        <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                          No homework assigned yet
                        </p>
                      </div>
                    ) : (
                      homeworkRows.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-5 bg-white dark:bg-slate-950/30 flex items-center justify-between gap-4"
                        >
                          <p className="truncate text-base font-semibold text-slate-900 dark:text-white">
                            {item.title}
                          </p>

                          {item.done ? (
                            <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="size-5" />
                              Done
                            </span>
                          ) : (
                            <span className="whitespace-nowrap text-sm font-semibold text-amber-600 dark:text-amber-400">
                              {item.dueLabel}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Weekly Practice */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden h-full">
                <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] font-semibold text-sky-600 dark:text-sky-400">
                      Weekly Practice
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                      7-Day Sprint
                    </h3>
                  </div>
                  <div className="size-14 rounded-full bg-sky-100/80 dark:bg-sky-900/25 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <CalendarCheck className="size-7" />
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-950/50 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-200">
                      <Clock className="size-5 text-sky-500 dark:text-sky-400" />
                      <span className="text-sm sm:text-base font-medium">
                        Weekly plan ready. Keep your streak for 7 days.
                      </span>
                    </div>

                    <Link
                      href="/profile/weekly-practice"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-bold px-5 py-2.5 transition-colors"
                    >
                      <CalendarCheck className="size-4" />
                      Open
                    </Link>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-5 bg-white dark:bg-slate-950/30 flex items-center justify-between gap-4">
                      <p className="truncate text-base font-semibold text-slate-900 dark:text-white">
                        Progress Timeline
                      </p>
                      <div className="flex gap-1.5">
                        {weekDots.map((_, idx) => (
                          <span
                            key={`week-dot-${idx}`}
                            className="size-2.5 rounded-full bg-gray-200 dark:bg-gray-700"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-5 bg-white dark:bg-slate-950/30 flex items-center justify-between gap-4">
                      <p className="truncate text-base font-semibold text-slate-900 dark:text-white">
                        Review Focus
                      </p>
                      <span className="whitespace-nowrap text-sm font-semibold text-sky-600 dark:text-sky-400">
                        This Week
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MISTAKES SECTION */}
            <section>
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                    <AlertCircle className="size-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Mistakes
                  </h2>
                </div>
                <Link
                  href="/profile/mistakes"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                  <p className="text-[14px] uppercase tracking-widest text-red-600 dark:text-red-400 font-semibold">
                    Recent Mistakes
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {mistakesStats.total}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">latest records</p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <p className="text-[14px] uppercase tracking-widest text-gray-500 font-semibold">
                    Error Hits
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {mistakesStats.totalErrors}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    accumulated attempts
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <p className="text-[14px] uppercase tracking-widest text-gray-500 font-semibold">
                    Hard Questions
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {mistakesStats.hard}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">need more review</p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <p className="text-[14px] uppercase tracking-widest text-gray-500 font-semibold">
                    Last Mistake
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {mistakesStats.latestAt
                      ? formatTimeAgo(mistakesStats.latestAt)
                      : "No record"}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    time since latest
                  </p>
                </div>
              </div>
            </section>

            {/* 3. BOOKMARKS SECTION */}
            <section>
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                    <BookMarked className="size-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Bookmarks
                  </h2>
                </div>
                <Link
                  href="/profile/bookmarks"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 md:col-span-2">
                  <p className="text-[14px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-semibold">
                    Saved Bookmarks
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {bookmarkStats.total}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    quick-access questions
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <p className="text-[14px] uppercase tracking-widest text-gray-500 font-semibold">
                    Hard
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                    {bookmarkStats.hard}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <p className="text-[14px] uppercase tracking-widest text-gray-500 font-semibold">
                    Medium
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                    {bookmarkStats.medium}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <p className="text-[14px] uppercase tracking-widest text-gray-500 font-semibold">
                    Easy
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                    {bookmarkStats.easy}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last:{" "}
                    {bookmarkStats.latestAt
                      ? formatTimeAgo(bookmarkStats.latestAt)
                      : "No record"}
                  </p>
                </div>
              </div>
            </section>

            {/* 4. ANALYTICS & STATS (Pushed below) */}
            <section>
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <TrendingUp className="size-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Analytics
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-8 mb-8">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Daily Trends
                  </h3>
                  <DailyTrendChart data={dailyActivity} />
                </div>
              </div>

              {/* Quick Stat Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <FileText className="size-6 text-blue-500 mb-2" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {answerStats.total}
                  </span>
                  <span className="text-xs text-gray-500 uppercase font-bold">
                    Questions
                  </span>
                </div>
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <Target className="size-6 text-green-500 mb-2" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {answerStats.accuracy}%
                  </span>
                  <span className="text-xs text-gray-500 uppercase font-bold">
                    Accuracy
                  </span>
                </div>
              </div>
            </section>

            {/* 5. MY QUESTION BANKS */}
            <section>
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
                    <Library className="size-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    My Question Banks
                  </h2>
                </div>
                <Link
                  href="/profile/question-banks"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userQuestionBanks && userQuestionBanks.length > 0 ? (
                  userQuestionBanks.slice(0, 2).map((item) => (
                    <Link
                      key={item.id}
                      href={`/question-banks/${slugOrEncodedId(item.question_banks.slug, item.bank_id)}`}
                      className="group p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 hover:from-violet-100 hover:to-purple-100 dark:hover:from-violet-900/30 dark:hover:to-purple-900/30 transition-all duration-300 border border-violet-100 dark:border-violet-800/50 hover:border-violet-200 dark:hover:border-violet-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-violet-200/50 dark:bg-violet-800/50 text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                          {item.question_banks.subjects?.name || "General"}
                        </span>
                        <ChevronRight className="size-4 text-gray-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
                        {item.question_banks.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Trophy className="size-3.5 text-amber-500" />
                          <span>{item.completion_count} completed</span>
                        </div>
                        {item.last_completed_at && (
                          <span className="text-gray-400">
                            Last: {formatTimeAgo(item.last_completed_at)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="md:col-span-2 p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/20 text-center border border-dashed border-gray-200 dark:border-gray-700">
                    <Library className="size-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium mb-2">
                      No question banks added yet
                    </p>
                    <Link
                      href="/library"
                      className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                    >
                      Browse question banks →
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* 5. MY MOCK EXAMS */}
            <section>
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <GraduationCap className="size-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    My Mock Exams
                  </h2>
                </div>
                <Link
                  href="/profile/mock-exams"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userExams && userExams.length > 0 ? (
                  userExams.slice(0, 2).map((item) => (
                    <Link
                      key={item.id}
                      href={`/practice/${slugOrEncodedId(item.exams.subjects?.slug, item.exams.subjects?.id || item.exams.subject_id)}/exam/${slugOrEncodedId(item.exams.slug, item.exam_id)}`}
                      className="group p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30 transition-all duration-300 border border-emerald-100 dark:border-emerald-800/50 hover:border-emerald-200 dark:hover:border-emerald-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-200/50 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                          {item.exams.subjects?.name || "Mock Exam"}
                        </span>
                        <ChevronRight className="size-4 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                        {item.exams.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Trophy className="size-3.5 text-amber-500" />
                          <span>{item.completion_count} attempts</span>
                        </div>
                        {item.best_score !== null && (
                          <div className="flex items-center gap-1">
                            <Target className="size-3.5 text-green-500" />
                            <span>Best: {item.best_score}%</span>
                          </div>
                        )}
                        {item.best_time_seconds !== null && (
                          <div className="flex items-center gap-1">
                            <Clock className="size-3.5 text-blue-500" />
                            <span>
                              {Math.floor(item.best_time_seconds / 60)}m
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="md:col-span-2 p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/20 text-center border border-dashed border-gray-200 dark:border-gray-700">
                    <GraduationCap className="size-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium mb-2">
                      No mock exams added yet
                    </p>
                    <Link
                      href="/library"
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Browse subjects and exams →
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
