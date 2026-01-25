import React from "react";
import { CheckCircle2, Circle } from "lucide-react";

export function FeatureQuestionBank() {
  return (
    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden flex flex-col font-sans border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="text-sm font-medium text-gray-500">Question Bank Practice</div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6 overflow-hidden relative">
        {/* Question */}
        <div className="flex gap-4">
          <span className="font-bold text-lg text-blue-600">1.</span>
          <div className="space-y-4 flex-1">
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
              Which of the following data structures is most efficient for implementing a priority queue?
            </p>
            
            <div className="grid gap-3">
              {[
                { id: "A", text: "Linked List", correct: false },
                { id: "B", text: "Binary Heap", correct: true },
                { id: "C", text: "Hash Map", correct: false },
                { id: "D", text: "Binary Search Tree", correct: false },
              ].map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                    option.correct
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : "bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      option.correct
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 text-gray-400"
                    }`}
                  >
                    {option.correct ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold">{option.id}</span>
                    )}
                  </div>
                  <span
                    className={`font-medium ${
                      option.correct
                        ? "text-green-700 dark:text-green-300"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {option.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Explanation Snippet */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20 animate-in fade-in slide-in-from-top-2 duration-700">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                Explanation:
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                A Binary Heap allows both insertion and extraction of the minimum/maximum element in O(log n) time, making it ideal for priority queues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
