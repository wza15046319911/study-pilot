"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Tag, TrendingDown, Lock, Sparkles } from "lucide-react";

// Simplified interface that matches what is actually passed
interface MistakeWithQuestion {
  questions: {
    topics?: {
      name: string;
    } | null;
    tags?: string[] | null;
  };
}

interface MistakesAnalyticsProps {
  mistakes: MistakeWithQuestion[];
  isPremium: boolean;
}

function PremiumLockOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 dark:bg-slate-900/80 backdrop-blur-[2px]">
      <div className="mx-4 max-w-xs rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-center shadow-lg dark:border-amber-900/50 dark:from-amber-950/70 dark:to-orange-950/60">
        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
          <Lock className="size-3.5" />
          Premium Analytics
        </div>
        <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
          Upgrade to Premium to unlock weakest topic and tag insights.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <Sparkles className="size-3.5" />
          View Premium
        </Link>
      </div>
    </div>
  );
}

export function MistakesAnalytics({
  mistakes,
  isPremium,
}: MistakesAnalyticsProps) {
  // Calculate analytics
  const { topTopics, topTags } = useMemo(() => {
    if (!isPremium) {
      return { topTopics: [], topTags: [] };
    }

    const topicCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    mistakes.forEach((m) => {
      // Count Topics
      const topicName = m.questions?.topics?.name;
      if (topicName) {
        topicCounts[topicName] = (topicCounts[topicName] || 0) + 1;
      }

      // Count Tags
      const tags = m.questions?.tags;
      if (Array.isArray(tags)) {
        tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Sort and get Top 3
    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag, count]) => ({ tag, count }));

    return { topTopics, topTags };
  }, [mistakes, isPremium]);

  if (mistakes.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      {/* Weakest Topics */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
            <TrendingDown className="size-5" />
          </div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Weakest Topics
          </h2>
        </div>

        <div
          className={`space-y-4 transition ${
            !isPremium ? "blur-[1.5px] select-none pointer-events-none" : ""
          }`}
          aria-hidden={!isPremium}
        >
          {isPremium && topTopics.length > 0 ? (
            topTopics.map((topic, index) => (
              <div
                key={topic.name}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center size-6 rounded-full bg-white dark:bg-slate-700 text-xs font-bold text-gray-500 shadow-sm border border-gray-100 dark:border-gray-600">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {topic.name}
                  </span>
                </div>
                <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded-md">
                  {topic.count} Mistakes
                </span>
              </div>
            ))
          ) : isPremium ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              No topic data available.
            </div>
          ) : (
            [1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[50px] rounded-xl bg-slate-100 dark:bg-slate-800/60"
              />
            ))
          )}
        </div>
        {!isPremium && <PremiumLockOverlay />}
      </div>

      {/* Common Tags */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
            <Tag className="size-5" />
          </div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Common Error Tags
          </h2>
        </div>

        <div
          className={`space-y-4 transition ${
            !isPremium ? "blur-[1.5px] select-none pointer-events-none" : ""
          }`}
          aria-hidden={!isPremium}
        >
          {isPremium && topTags.length > 0 ? (
            topTags.map((tag, index) => (
              <div
                key={tag.tag}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center size-6 rounded-full bg-white dark:bg-slate-700 text-xs font-bold text-gray-500 shadow-sm border border-gray-100 dark:border-gray-600">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {tag.tag}
                  </span>
                </div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20 px-2 py-1 rounded-md">
                  {tag.count} Mistakes
                </span>
              </div>
            ))
          ) : isPremium ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              No tag data available.
            </div>
          ) : (
            [1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[50px] rounded-xl bg-slate-100 dark:bg-slate-800/60"
              />
            ))
          )}
        </div>
        {!isPremium && <PremiumLockOverlay />}
      </div>
    </div>
  );
}
