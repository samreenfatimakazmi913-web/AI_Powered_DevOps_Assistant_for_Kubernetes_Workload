import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function MemoryUsageChart() {
  // Dummy data for memory usage per deployment
  const memoryData = [
    { name: "deployment-auth", value: 2.5 }, // GB
    { name: "deployment-api", value: 1.8 },
    { name: "deployment-frontend", value: 1.2 },
    { name: "deployment-worker", value: 0.8 },
    { name: "deployment-logging", value: 0.5 }
  ];

  const COLORS = ["#2563eb", "#059669", "#d97706", "#dc2626", "#8b5cf6"];

  return (
    <div className="bg-white dark:bg-[#111827] p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-3">RAM Usage of Deployments</h2>

      <div className="w-full h-[300px]"> {/* Reduced height from 400px to 300px */}
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={memoryData}
              cx="45%" // shift left for right-side legend
              cy="50%"
              outerRadius={100} // reduced radius from 140 to 100
              label={({ value }) => `${value} GB`} // show only GB inside slices
              dataKey="value"
              labelLine={false}
            >
              {memoryData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} GB`} />
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
