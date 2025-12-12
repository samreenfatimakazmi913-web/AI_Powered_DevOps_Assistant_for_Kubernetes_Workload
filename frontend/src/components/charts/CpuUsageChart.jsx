import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function CpuUsageChart() {
  // Dummy data for CPU usage per deployment
  const cpuData = [
    { name: "deployment-auth", value: 35 },
    { name: "deployment-api", value: 25 },
    { name: "deployment-frontend", value: 20 },
    { name: "deployment-worker", value: 15 },
    { name: "deployment-logging", value: 5 }
  ];

  const COLORS = ["#2563eb", "#059669", "#d97706", "#dc2626", "#8b5cf6"];

  return (
    <div className="bg-white dark:bg-[#111827] p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-3">CPU Usage of Deployments</h2>

      <div className="w-full h-[300px]"> {/* Reduced height from 400px to 300px */}
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={cpuData}
              cx="45%"  // slightly left to make room for right legend
              cy="50%"
              labelLine={false}
              outerRadius={100} // reduced radius from 140 to 100
              fill="#8884d8"
              dataKey="value"
              label={({ value }) => `${value}%`} // show only %
            >
              {cpuData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              iconType="circle"
              formatter={(value, entry, index) => (
                <span style={{ color: COLORS[index] }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
