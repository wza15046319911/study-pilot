"use client";

import React from "react";

interface DifficultyAnalysisProps {
  stats: {
    level: string; // Easy, Medium, Hard
    total: number;
    correct: number;
    accuracy: number;
  }[];
}

export function DifficultyAnalysis({ stats }: DifficultyAnalysisProps) {
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getLevelBg = (level: string) => {
    switch (level.toLowerCase()) {
      case "easy":
        return "bg-green-100 dark:bg-green-900/20";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/20";
      case "hard":
        return "bg-red-100 dark:bg-red-900/20";
      default:
        return "bg-gray-100 dark:bg-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {stats.map((stat) => (
        <div key={stat.level} className="relative">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {stat.level} ({stat.accuracy}%)
            </span>
            <span className="text-gray-500 text-xs">
              {stat.correct}/{stat.total}
            </span>
          </div>
          <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${getLevelColor(
                stat.level
              )} rounded-full transition-all duration-500`}
              style={{ width: `${stat.accuracy}%` }}
            />
          </div>
        </div>
      ))}

      {stats.every((s) => s.total === 0) && (
        <div className="text-center text-sm text-gray-400 py-4">
          No practice data available yet.
        </div>
      )}
    </div>
  );
}
