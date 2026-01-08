import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function CpuUsageChart() {
  /* ---- Trend Data ---- */
  const lineData = [
    { time: "10:00", value: 32 },
    { time: "10:10", value: 45 },
    { time: "10:20", value: 61 },
    { time: "10:30", value: 58 },
  ];

  /* ---- Distribution Data ---- */
  const pieData = [
    { name: "API", value: 35 },
    { name: "Auth", value: 25 },
    { name: "Worker", value: 20 },
    { name: "System", value: 20 },
  ];

  const COLORS = ["#22C55E", "#16A34A", "#4ADE80", "#86EFAC"];

  return (
    <div className="
      bg-white dark:bg-[#111827]
      rounded-2xl p-6
      shadow-md hover:shadow-xl
      transition-all duration-300
    ">
      <h2 className="text-lg font-semibold mb-4">CPU Usage</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* -------- PIE -------- */}
        <div className="h-[220px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={55}
                outerRadius={80}
                dataKey="value"
                paddingAngle={4}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <p className="text-xs text-center text-gray-500 mt-2">
            CPU Distribution
          </p>
        </div>

        {/* -------- LINE -------- */}
        <div className="h-[220px]">
          <ResponsiveContainer>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis unit="%" tick={{ fontSize: 12 }} />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#22C55E"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>

          <p className="text-xs text-center text-gray-500 mt-2">
            CPU Trend
          </p>
        </div>
      </div>
    </div>
  );
}
