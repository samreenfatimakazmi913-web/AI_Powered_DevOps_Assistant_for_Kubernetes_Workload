import React from "react";
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

const COLORS = ["#22C55E", "#E5E7EB"]; // green + gray

function getHealthStatus(usedPercent) {
  if (usedPercent < 60) {
    return { label: "Healthy", color: "bg-green-100 text-green-700 border-green-300" };
  }
  if (usedPercent < 80) {
    return { label: "Warning", color: "bg-yellow-100 text-yellow-700 border-yellow-300" };
  }
  return { label: "Critical", color: "bg-red-100 text-red-700 border-red-300" };
}

export default function ResourceUsageCard({
  title,
  pieData,
  lineData,
  lineColor,
  unit,
}) {
  const used = pieData.find(p => p.name === "Used")?.value || 0;
  const health = getHealthStatus(used);

  return (
    <div className="rounded-2xl border p-5 bg-white dark:bg-[#0f172a] shadow-sm hover:shadow-md transition">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>

        <span
          className={`text-xs px-3 py-1 rounded-full border font-medium ${health.color}`}
        >
          {health.label}
        </span>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">

        {/* Pie */}
        <div className="h-[180px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={50}
                outerRadius={70}
                dataKey="value"
                paddingAngle={3}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <p className="text-center text-sm mt-1 text-gray-500">
            Used: <b>{used}%</b>
          </p>
        </div>

        {/* Line */}
        <div className="h-[180px]">
          <ResponsiveContainer>
            <LineChart data={lineData}>
              <XAxis dataKey="time" hide />
              <YAxis hide />
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
    </div>
  );
}
