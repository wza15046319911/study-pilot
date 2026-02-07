"use client";

import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";

interface DailyTrendChartProps {
  data: {
    date: string;
    count: number;
    correct: number;
  }[];
}

export function DailyTrendChart({ data }: DailyTrendChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    accuracy: item.count > 0 ? Math.round((item.correct / item.count) * 100) : 0,
  }));

  const tooltipStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "8px",
    border: "none",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    fontSize: "12px",
  };

  return (
    <div className="w-full min-w-0 mt-4 space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Daily Questions
        </p>
        <div className="h-[220px] min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                interval={1}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value) => [value, "Questions"]}
                labelFormatter={(label) => `${label}`}
                cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#dbeafe">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`count-cell-${index}`}
                    fill={entry.count > 0 ? "#60a5fa" : "#e5e7eb"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Daily Accuracy
        </p>
        <div className="h-[220px] min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                interval={1}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Accuracy"]}
                labelFormatter={(label) => `${label}`}
                contentStyle={tooltipStyle}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 2, strokeWidth: 2, fill: "#ffffff" }}
                activeDot={{ r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
