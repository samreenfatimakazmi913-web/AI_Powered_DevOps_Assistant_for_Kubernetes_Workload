import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function DeploymentCharts({ data = [] }) {
  // 📊 Transform data for chart
  const chartData = useMemo(() => {
    return data.map((d) => {
      const desired = d.spec?.replicas ?? 1;
      const ready = d.status?.readyReplicas ?? 0;

      return {
        name: d.metadata?.name || "unknown",
        ready,
        desired,
      };
    });
  }, [data]);

  const namespaceData = useMemo(() => {
  const map = {};

  data.forEach((d) => {
    const ns = d.metadata?.namespace || "unknown";
    map[ns] = (map[ns] || 0) + 1;
  });

  return Object.entries(map).map(([namespace, count]) => ({
    namespace,
    count,
  }));
}, [data]);

  // 📈 Health ratio calculation
  const { healthyCount, total, percentage } = useMemo(() => {
    const total = data.length;

    const healthyCount = data.filter((d) => {
      const desired = d.spec?.replicas ?? 1;
      const ready = d.status?.readyReplicas ?? 0;
      return ready === desired;
    }).length;

    const percentage = total > 0 ? Math.round((healthyCount / total) * 100) : 0;

    return { healthyCount, total, percentage };
  }, [data]);

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-4">

      {/* 🔹 KPI CARD */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm flex flex-col justify-center">

  <p className="text-sm text-gray-500 mb-1">Deployment Health</p>

  <div className="flex items-end gap-2">
    <h2 className="text-3xl font-bold text-gray-800 leading-none">
      {healthyCount}
    </h2>
    <span className="text-gray-400 text-sm mb-1">/ {total}</span>
    <span className="ml-auto text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
  {percentage}%
</span>
  </div>

  <p className="text-xs text-gray-400 mt-1">Healthy deployments</p>

  {/* Progress */}
  <div className="mt-3">
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${
          percentage > 80
            ? "bg-green-500"
            : percentage > 50
            ? "bg-yellow-500"
            : "bg-red-500"
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>

</div>

      {/* 🔹 BAR CHART */}
      <div className="md:col-span-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-2">
          Ready vs Desired Replicas
        </p>

        <div className="w-full h-64">
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              
              <YAxis allowDecimals={false} />
              
              <Tooltip />
              <Legend />

              <Bar dataKey="desired" fill="#94a3b8" name="Desired" />
              <Bar dataKey="ready" fill="#22c55e" name="Ready" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
  <p className="text-sm text-gray-500 mb-2">
    Deployments per Namespace
  </p>

  <div className="w-full h-64">
    <ResponsiveContainer>
      <BarChart data={namespaceData}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="namespace"
          tick={{ fontSize: 10 }}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={60}
        />

        <YAxis allowDecimals={false} />
        <Tooltip />

        <Bar dataKey="count" fill="#6366f1" name="Deployments" />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>
    </div>
  );
}