import React from "react";
import { CalendarDays, Target, Clock3, CheckCircle2 } from "lucide-react";

export function FeatureWeeklyPractice() {
  const tasks = [
    { day: "Mon", topic: "Dynamic Programming", status: "done" },
    { day: "Wed", topic: "Graph Traversal", status: "active" },
    { day: "Fri", topic: "Complexity Review", status: "pending" },
  ];

  return (
    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden flex flex-col font-sans border border-gray-200 dark:border-gray-800">
      <div className="border-b border-gray-100 dark:border-gray-800 p-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
            Weekly Practice
          </p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Week 7 Plan
          </h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>

      <div className="flex-1 p-6 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/80 dark:bg-emerald-900/10 p-3">
            <p className="text-xs text-gray-500">Target</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              120 Qs
            </p>
          </div>
          <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/80 dark:bg-blue-900/10 p-3">
            <p className="text-xs text-gray-500">Done</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              84
            </p>
          </div>
          <div className="rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/80 dark:bg-amber-900/10 p-3">
            <p className="text-xs text-gray-500">Streak</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              6 days
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.day}
              className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 bg-gray-50 dark:bg-slate-950/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="text-xs font-bold text-gray-500 w-8">
                  {task.day}
                </div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {task.topic}
                </p>
              </div>
              {task.status === "done" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
              {task.status === "active" && (
                <Target className="w-4 h-4 text-blue-500" />
              )}
              {task.status === "pending" && (
                <Clock3 className="w-4 h-4 text-amber-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
