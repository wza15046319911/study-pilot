import React from "react";
import { ClipboardList, AlarmClock, CheckCircle2, Upload } from "lucide-react";

export function FeatureHomework() {
  const assignments = [
    { title: "Linked List Drills", due: "Tonight 23:59", done: false },
    { title: "Sorting Proof Questions", due: "Fri 18:00", done: false },
    { title: "Recursion Warmup", due: "Submitted", done: true },
  ];

  return (
    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden flex flex-col font-sans border border-gray-200 dark:border-gray-800">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">
            Homework
          </p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Assigned Sets
          </h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <AlarmClock className="w-4 h-4 text-amber-500" />
            <span>2 assignments due this week</span>
          </div>
          <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            Submit
          </button>
        </div>

        <div className="space-y-3">
          {assignments.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-slate-950/30"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {item.title}
                </p>
                {item.done ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Done
                  </span>
                ) : (
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    {item.due}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
