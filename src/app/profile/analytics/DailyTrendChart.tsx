"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DailyTrendChartProps {
  data: {
    date: string;
    count: number;
    correct: number;
  }[];
}

export function DailyTrendChart({ data }: DailyTrendChartProps) {
  // Determine if it's light or dark mode - simple check or pass via props
  // For now we'll use CSS variables or classes where possible
  // Recharts styling is a bit specific

  return (
    <div className="w-full h-[300px] min-h-[300px] min-w-0 mt-4">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minHeight={300}
        minWidth={0}
      >
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            interval={1} // Show every other day if needed, or adjust based on data length
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.count > 0 ? "#2563eb" : "#e5e7eb"} // Blue if active, grey placeholder if 0 (though 0 won't show much)
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
