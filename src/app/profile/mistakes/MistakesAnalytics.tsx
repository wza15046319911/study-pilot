"use client";

import React, { useMemo } from "react";
import { AlertCircle, Tag, TrendingDown } from "lucide-react";
import { Mistake } from "@/types/database";

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
}

export function MistakesAnalytics({ mistakes }: MistakesAnalyticsProps) {
  // Calculate analytics
  const { topTopics, topTags } = useMemo(() => {
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
  }, [mistakes]);

  if (mistakes.length === 0) return null;

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Weakest Topics */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
            <TrendingDown className="size-5" />
          </div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Weakest Topics
          </h2>
        </div>

        <div className="space-y-4">
          {topTopics.length > 0 ? (
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
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm">
              No topic data available.
            </div>
          )}
        </div>
      </div>

      {/* Common Tags */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
            <Tag className="size-5" />
          </div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Common Error Tags
          </h2>
        </div>

        <div className="space-y-4">
          {topTags.length > 0 ? (
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
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm">
              No tag data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
