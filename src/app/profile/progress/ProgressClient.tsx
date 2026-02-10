"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Target,
  BookOpen,
  Hash,
} from "lucide-react";
import { Subject, Topic } from "@/types/database";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Define the shape of data we expect
export interface TopicWithProgress extends Topic {
  question_count?: number; // Added this
  progress?: {
    correct_count: number;
    completed_count: number;
  };
}

export interface SubjectWithTopics extends Subject {
  topics: TopicWithProgress[];
  progress?: {
    correct_count: number;
    completed_count: number;
  };
}

export interface TagStat {
  tag: string;
  total: number;
  correct: number;
  accuracy: number;
}

interface ProgressClientProps {
  subjects: SubjectWithTopics[];
  tagStats: {
    weak: TagStat[];
    strong: TagStat[];
    all: TagStat[];
  };
}

export function ProgressClient({ subjects, tagStats }: ProgressClientProps) {
  const t = useTranslations("profileProgress");
  const [activeTab, setActiveTab] = useState<"mastery" | "weakness">("mastery");
  const [expandedSubjects, setExpandedSubjects] = useState<number[]>(
    subjects.map((s) => s.id) // Default all expanded
  );

  const toggleSubject = (id: number) => {
    setExpandedSubjects((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80)
      return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
    if (accuracy >= 60)
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
  };

  const getProgressBarColor = (accuracy: number) => {
    if (accuracy >= 80) return "bg-green-500";
    if (accuracy >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Helper to calculate generic stats for overview
  const totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0);
  const topicsStarted = subjects.reduce(
    (acc, s) =>
      acc +
      s.topics.filter((t) => (t.progress?.completed_count || 0) > 0).length,
    0
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header / Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          {t("breadcrumb.home")}
        </Link>
        <ChevronRight className="size-4" />
        <Link href="/profile" className="hover:text-blue-600 transition-colors">
          {t("breadcrumb.profile")}
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-gray-900 dark:text-white font-medium">
          {t("breadcrumb.progress")}
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4">
          <div className="px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
              {t("quickStats.topics")}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {topicsStarted} / {totalTopics}
            </p>
          </div>
          <div className="px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
              {t("quickStats.weakTags")}
            </p>
            <p className="text-xl font-bold text-red-500">
              {tagStats.weak.length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("mastery")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-[background-color,color,box-shadow] flex items-center gap-2",
            activeTab === "mastery"
              ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          <BookOpen className="size-4" />
          {t("tabs.topicMastery")}
        </button>
        <button
          onClick={() => setActiveTab("weakness")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-[background-color,color,box-shadow] flex items-center gap-2",
            activeTab === "weakness"
              ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          <Target className="size-4" />
          {t("tabs.weakPoints")}
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === "mastery" ? (
          <div className="space-y-6">
            {subjects.map((subject) => {
              const isExpanded = expandedSubjects.includes(subject.id);
              // Subject Level Stats
              const totalQuestions = subject.progress?.completed_count || 0;
              const totalCorrect = subject.progress?.correct_count || 0;
              const accuracy =
                totalQuestions > 0
                  ? Math.round((totalCorrect / totalQuestions) * 100)
                  : 0;

              return (
                <div
                  key={subject.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
                >
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between"
                    onClick={() => toggleSubject(subject.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                        <BookOpen className="size-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {t("subjectSummary", {
                            topics: subject.topics.length,
                            questions: totalQuestions,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {t("overallAccuracy")}
                        </p>
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded-md",
                              getAccuracyColor(accuracy)
                            )}
                          >
                            {accuracy}%
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="size-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="size-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Topics List */}
                  <div
                    className={cn(
                      "border-t border-gray-100 dark:border-gray-800 transition-[max-height,opacity] duration-300 ease-in-out",
                      isExpanded
                        ? "max-h-[2000px] opacity-100"
                        : "max-h-0 opacity-0 overflow-hidden"
                    )}
                  >
                    <div className="p-6 grid gap-4">
                      {subject.topics.map((topic) => {
                        const tQuestions = topic.progress?.completed_count || 0;
                        const tCorrect = topic.progress?.correct_count || 0;
                        const tAccuracy =
                          tQuestions > 0
                            ? Math.round((tCorrect / tQuestions) * 100)
                            : 0;

                        // Use topic.question_count if available, otherwise tQuestions (so 100% width) or 1 to avoid NaN
                        const totalTopicQuestions =
                          topic.question_count || tQuestions || 1;

                        return (
                          <div
                            key={topic.id}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex-1 mr-8">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-700 dark:text-gray-200">
                                  {topic.name}
                                </h4>
                                <span
                                  className={cn(
                                    "text-xs font-bold px-2 py-0.5 rounded-md",
                                    getAccuracyColor(tAccuracy)
                                  )}
                                >
                                  {tAccuracy}%
                                </span>
                              </div>

                              {/* Progress Bar Container */}
                              <div className="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-2.5 overflow-hidden relative">
                                {/* Attempted Layer (Lighter) - How many unique questions ATTEMPTED vs Total Questions in Topic */}
                                <div
                                  className="absolute inset-y-0 left-0 bg-blue-200 dark:bg-blue-900/50 rounded-full transition-[width] duration-500"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (tQuestions / totalTopicQuestions) * 100
                                    )}%`,
                                  }}
                                />
                                {/* Correct Layer (Solid) - How many unique questions CORRECT vs Total Questions in Topic */}
                                <div
                                  className={cn(
                                    "absolute inset-y-0 left-0 h-full rounded-full transition-[width] duration-500",
                                    getProgressBarColor(tAccuracy)
                                  )}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (tCorrect / totalTopicQuestions) * 100
                                    )}%`,
                                  }}
                                />
                              </div>

                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                                <span>
                                  {t("topic.mastered", {
                                    correct: tCorrect,
                                    total: totalTopicQuestions,
                                  })}
                                </span>
                                <span>{t("topic.attempted", { count: tQuestions })}</span>
                              </div>
                            </div>
                            <Link
                              href={`/library/${subject.slug}/practice?topic=${topic.slug}`}
                              className="shrink-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors shadow-sm"
                            >
                              <ChevronRight className="size-5" />
                            </Link>
                          </div>
                        );
                      })}
                      {subject.topics.length === 0 && (
                        <p className="text-center text-gray-500 py-4">
                          {t("topic.empty")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Weak Areas */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                  <AlertCircle className="size-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("weak.title")}
                </h2>
              </div>
              {tagStats.weak.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tagStats.weak.map((stat) => (
                    <div
                      key={stat.tag}
                      className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex items-start justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="size-3 text-red-400" />
                          <span className="font-bold text-gray-900 dark:text-white text-sm">
                            {stat.tag}
                          </span>
                        </div>
                        <div className="text-xs text-red-600/80 dark:text-red-400/80 font-medium">
                          {t("ratioCorrect", {
                            correct: stat.correct,
                            total: stat.total,
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-red-600 dark:text-red-400">
                          {stat.accuracy}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="size-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Target className="size-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {t("weak.emptyTitle")}
                  </h3>
                  <p className="text-gray-500">
                    {t("weak.emptyDescription")}
                  </p>
                </div>
              )}
            </div>

            {/* Strong Areas */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                  <CheckCircle2 className="size-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("strong.title")}
                </h2>
              </div>
              {tagStats.strong.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tagStats.strong.map((stat) => (
                    <div
                      key={stat.tag}
                      className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 flex items-start justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="size-3 text-green-400" />
                          <span className="font-bold text-gray-900 dark:text-white text-sm">
                            {stat.tag}
                          </span>
                        </div>
                        <div className="text-xs text-green-600/80 dark:text-green-400/80 font-medium">
                          {t("ratioCorrect", {
                            correct: stat.correct,
                            total: stat.total,
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                          {stat.accuracy}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="size-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <TrendingUp className="size-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {t("strong.emptyTitle")}
                  </h3>
                  <p className="text-gray-500">
                    {t("strong.emptyDescription")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
