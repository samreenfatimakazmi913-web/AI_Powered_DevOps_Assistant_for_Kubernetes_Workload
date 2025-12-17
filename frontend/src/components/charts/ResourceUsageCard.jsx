// ===============================
// src/components/charts/ResourceUsageCard.jsx
// ===============================

import React from "react";
import { Card } from "../ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const COLORS = ["#22C55E", "#E5E7EB"]; // Used / Free

export default function ResourceUsageCard({
  title,
  pieData,
  lineData,
  lineColor,
  unit,
}) {
  return (
    <Card className="p-4 sm:p-5 shadow-sm dark:text-gray-200">
      {/* TITLE */}
      <h2 className="text-base sm:text-lg font-semibold mb-4 dark:text-white">
        {title}
      </h2>

      {/* CONTENT */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* -------- PIE CHART -------- */}
        <div className="w-full sm:w-1/3 h-40 sm:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={30}
                outerRadius={60}   // 🔥 mobile-friendly size
                paddingAngle={4}
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* LEGEND */}
          <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i] }}
                />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        {/* -------- LINE CHART -------- */}
        <div className="w-full sm:w-2/3 h-44 sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10 }}
                stroke="#9CA3AF"
              />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke="#9CA3AF"
                tickFormatter={(v) => `${v}${unit}`}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke={lineColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
