"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Subject } from "@/types/database";

interface SubjectRadarChartProps {
  progress: {
    subjects: Subject;
    total_attempts: number;
    unique_completed: number;
    unique_correct: number;
  }[];
}

export function SubjectRadarChart({ progress }: SubjectRadarChartProps) {
  // Transform data for radar chart
  // We want to normalize data to show "Mastery" or "Completion"
  // Let's use Accuracy % for now, maybe weighted by completion if reasonable
  const data = progress.slice(0, 6).map((item) => {
    const total = item.subjects.question_count || 1; // avoid divide by zero
    // const completion = (item.unique_completed / total) * 100;
    const accuracy =
      item.unique_completed > 0
        ? Math.round((item.unique_correct / item.unique_completed) * 100)
        : 0;

    return {
      subject: item.subjects.name,
      A: accuracy,
      fullMark: 100,
    };
  });

  if (data.length < 3) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm text-center px-8">
        Complete questions in at least 3 subjects to unlock the Radar Chart!
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#6b7280", fontSize: 10 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Accuracy"
            dataKey="A"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
