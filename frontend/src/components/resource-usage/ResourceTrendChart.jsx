import React from "react";
import { Card } from "../ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/**
 * Props:
 * - title: string
 * - data: [{ time, value }]
 * - unit: "%" | "GiB" | etc
 * - timeRange: "15m" | "1h" | "6h" | "24h"
 * - namespace: string
 * - pod: string
 */
export default function ResourceTrendChart({
  title,
  data = [],
  unit,
  timeRange,
  namespace,
  pod,
}) {
  return (
    <Card
      className="
        p-5
        bg-white dark:bg-[#0b111b]
        border border-gray-200 dark:border-gray-800
      "
    >
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h3 className="font-semibold text-base sm:text-lg">
          {title}
        </h3>

        {/* CONTEXT INFO */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {namespace !== "all" && (
            <span>Namespace: <b>{namespace}</b> • </span>
          )}
          {pod !== "all" && (
            <span>Pod: <b>{pod}</b> • </span>
          )}
          <span>Range: <b>{timeRange}</b></span>
        </div>
      </div>

      {/* ================= CHART ================= */}
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              className="dark:stroke-gray-700"
            />

            <XAxis
              dataKey="time"
              tick={{ fontSize: 11 }}
              stroke="#9CA3AF"
            />

            <YAxis
              tick={{ fontSize: 11 }}
              stroke="#9CA3AF"
              tickFormatter={(v) => `${v}${unit}`}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#0b111b",
                border: "none",
                borderRadius: 6,
                color: "#fff",
                fontSize: 12,
              }}
              labelStyle={{ color: "#93C5FD" }}
              formatter={(value) => [`${value}${unit}`, "Usage"]}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
