import React from "react";
import { BarChart3, AlertTriangle, TrendingUp } from "lucide-react";

const topicStats = [
  { topic: "Graphs", mistakes: 12, width: "w-[90%]" },
  { topic: "DP", mistakes: 8, width: "w-[62%]" },
  { topic: "Trees", mistakes: 5, width: "w-[40%]" },
];

export function FeatureMistakeAnalysis() {
  return (
    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden flex flex-col font-sans border border-gray-200 dark:border-gray-800 p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-wider font-bold text-rose-600 dark:text-rose-400">
            Mistakes Analysis
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Weak Point Heatmap
          </h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 p-4">
          <p className="text-xs text-gray-500 mb-1">Total mistakes</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">25</p>
        </div>
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-4">
          <p className="text-xs text-gray-500 mb-1">Recovery rate</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">+18%</p>
        </div>
      </div>

      <div className="space-y-4">
        {topicStats.map((item) => (
          <div key={item.topic} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {item.topic}
              </span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {item.mistakes} mistakes
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400 ${item.width}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Review priority: Graphs this week
        </div>
        <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="w-3.5 h-3.5" />
          Improving
        </div>
      </div>
    </div>
  );
}
