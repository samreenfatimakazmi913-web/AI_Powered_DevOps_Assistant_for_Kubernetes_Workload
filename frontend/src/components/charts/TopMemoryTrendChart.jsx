import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function TopMemoryTrendChart({ data, deployments }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-soft h-[340px]">
      <h2 className="text-sm font-semibold mb-4 text-text">
        Top 5 Memory Trends
      </h2>

      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />

          {deployments.map((d) => (
            <Line
              key={d}
              type="monotone"
              dataKey={d}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}