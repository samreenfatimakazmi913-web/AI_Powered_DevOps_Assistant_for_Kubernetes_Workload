// ===============================
// src/components/charts/ResourceUsageCard.jsx
// ===============================

import React, { useState } from "react";
import { Card } from "../ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// Indigo-anchored palette — consistent with app theme
const COLORS = [
  "#6366F1", // indigo-500
  "#3B82F6", // blue-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#8B5CF6", // violet-500
  "#06B6D4", // cyan-500
  "#F97316", // orange-500
  "#14B8A6", // teal-500
  "#EC4899", // pink-500
  "#84CC16", // lime-500
  "#64748B", // slate-500
];

// ─── Formatters ───────────────────────────────────────────────────────────────
function formatCpu(m) {
  if (m >= 1000) return `${(m / 1000).toFixed(2)} cores`;
  return `${Math.round(m)} m`;
}

function formatMem(mib) {
  if (mib >= 1024) return `${(mib / 1024).toFixed(2)} GiB`;
  return `${Math.round(mib)} MiB`;
}

function fmt(value, unit) {
  return unit === "cpu" ? formatCpu(value) : formatMem(value);
}

// ─── Donut center label ───────────────────────────────────────────────────────
function CenterLabel({ viewBox, total, unit, label }) {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle"
        className="fill-slate-800" style={{ fontSize: 20, fontWeight: 700 }}>
        {fmt(total, unit)}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle"
        className="fill-slate-400" style={{ fontSize: 11 }}>
        {label}
      </text>
    </g>
  );
}

// ─── Rich tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, unit, total }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm min-w-[140px]">
      <p className="font-semibold text-slate-800 truncate mb-1">{name}</p>
      <p className="text-indigo-600 font-medium">{fmt(value, unit)}</p>
      <p className="text-slate-400 text-xs">{pct}% of total</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ResourceUsageCard({ title, pieData = [], unit = "cpu" }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const total = pieData.reduce((sum, item) => sum + item.value, 0);

  // Collapse items < 1% into "Others"
  const sorted = [...pieData].sort((a, b) => b.value - a.value);
  const major = [];
  let othersValue = 0;
  sorted.forEach(item => {
    if (total > 0 && item.value / total >= 0.01) major.push(item);
    else othersValue += item.value;
  });
  if (othersValue > 0) major.push({ name: "Others", value: othersValue });

  const topConsumer = major[0];
  const centerLabel = unit === "cpu" ? "total CPU" : "total memory";

  if (total === 0) {
    return (
      <Card className="p-6 shadow-sm bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center min-h-[260px]">
        <p className="text-slate-400 text-sm">No {unit === "cpu" ? "CPU" : "memory"} data available</p>
        <p className="text-slate-300 text-xs mt-1">Metrics server may not be running</p>
      </Card>
    );
  }

  return (
    <Card className="p-5 shadow-sm bg-white rounded-2xl border border-slate-200">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">{title}</h2>
        <div className="text-right">
          <span className="text-xs text-slate-400">Total: </span>
          <span className="text-sm font-bold text-slate-800">{fmt(total, unit)}</span>
        </div>
      </div>

      {/* Top consumer bar */}
      {topConsumer && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
          <span className="text-indigo-500 font-medium">Top consumer</span>
          <span className="font-semibold text-indigo-700 truncate max-w-[120px]">{topConsumer.name}</span>
          <span className="text-indigo-600 font-bold">
            {fmt(topConsumer.value, unit)}
            <span className="text-indigo-400 font-normal ml-1">
              ({total > 0 ? ((topConsumer.value / total) * 100).toFixed(0) : 0}%)
            </span>
          </span>
        </div>
      )}

      {/* Chart + legend side-by-side */}
      <div className="flex items-center gap-4">

        {/* Donut */}
        <div className="shrink-0 w-[180px] h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={major}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={2}
                onMouseEnter={(_, i) => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {major.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                    opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.45}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
                {/* Center label rendered as SVG inside the donut hole */}
                <text
                  x="50%"
                  y="44%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: 14, fontWeight: 700, fill: "#1e293b" }}
                >
                  {fmt(total, unit)}
                </text>
                <text
                  x="50%"
                  y="60%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: 9, fill: "#94a3b8" }}
                >
                  {centerLabel}
                </text>
              </Pie>
              <Tooltip content={<CustomTooltip unit={unit} total={total} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / ranked list */}
        <div className="flex-1 space-y-2 overflow-hidden">
          {major.slice(0, 7).map((item, index) => {
            const pct = total > 0 ? (item.value / total) * 100 : 0;
            const isHovered = hoveredIndex === index;
            return (
              <div
                key={item.name}
                className={`transition-opacity ${hoveredIndex !== null && !isHovered ? "opacity-40" : "opacity-100"}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-slate-600 truncate max-w-[90px]" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                  <span className="text-slate-500 font-medium shrink-0 ml-1">
                    {fmt(item.value, unit)}
                  </span>
                </div>
                {/* Mini progress bar */}
                <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
              </div>
            );
          })}
          {major.length > 7 && (
            <p className="text-xs text-slate-400 pt-1">
              +{major.length - 7} more workloads
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
