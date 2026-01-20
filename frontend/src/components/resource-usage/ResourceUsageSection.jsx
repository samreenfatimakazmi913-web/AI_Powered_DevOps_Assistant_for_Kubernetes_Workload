import React, { useMemo, useState, useEffect } from "react";
import ResourceFilters from "./ResourceFilters";
import ResourceGauges from "./ResourceGuages";
import ResourceTrendChart from "./ResourceTrendChart";

const RED = "#8B0000";

export default function ResourceUsageSection({
  pods = [],
  namespaces = [],
  refreshKey,
}) {
  /* ---------------- SAFE DATA ---------------- */
  const safePods = Array.isArray(pods) ? pods : [];
  const safeNamespaces = Array.isArray(namespaces) ? namespaces : [];

  /* ---------------- FILTER STATES ---------------- */
  const [metricNamespace, setMetricNamespace] = useState("all");
  const [metricPod, setMetricPod] = useState("all");
  const [timeRange, setTimeRange] = useState("1h");
  const [metricType, setMetricType] = useState("cpu");

  useEffect(() => {
    // later: API call here
  }, [metricNamespace, metricPod, timeRange, refreshKey]);

  /* ---------------- DERIVED PODS ---------------- */
  const namespacePods = useMemo(() => {
    if (metricNamespace === "all") return safePods;
    return safePods.filter(
      p => p.metadata?.namespace === metricNamespace
    );
  }, [safePods, metricNamespace]);

  const handleNamespaceChange = (ns) => {
    setMetricNamespace(ns);
    setMetricPod("all");
  };

  /* ---------------- MOCK METRICS ---------------- */
  const cpuMetrics = {
    used: 22,
    total: 24,
    trend: [
      { time: "10:00", value: 12 },
      { time: "10:10", value: 18 },
      { time: "10:20", value: 22 },
      { time: "10:30", value: 19 },
      { time: "10:40", value: 21 },
    ],
  };

  const memoryMetrics = {
    used: 46.9,
    total: 86.1,
    trend: [
      { time: "10:00", value: 42 },
      { time: "10:10", value: 44 },
      { time: "10:20", value: 48 },
      { time: "10:30", value: 47 },
      { time: "10:40", value: 46 },
    ],
  };

  return (
    <div className="space-y-6">

      {/* FILTERS */}
      <ResourceFilters
        namespaces={safeNamespaces}
        pods={namespacePods}
        selectedNamespace={metricNamespace}
        selectedPod={metricPod}
        timeRange={timeRange}
        onNamespaceChange={handleNamespaceChange}
        onPodChange={setMetricPod}
        onTimeRangeChange={setTimeRange}
      />

      {/* GAUGES */}
      <ResourceGauges
        cpuUsed={cpuMetrics.used}
        cpuTotal={cpuMetrics.total}
        memoryUsed={memoryMetrics.used}
        memoryTotal={memoryMetrics.total}
      />

      {/* TOGGLE */}
      <div className="flex gap-4 text-sm">
        {["cpu", "memory"].map(type => (
          <button
            key={type}
            onClick={() => setMetricType(type)}
            className={`px-4 py-2 rounded-md border transition
              ${
                metricType === type
                  ? "bg-[#8B0000] text-white border-[#8B0000]"
                  : "bg-white border-gray-300"
              }`}
          >
            {type === "cpu" ? "CPU Trend" : "Memory Trend"}
          </button>
        ))}
      </div>

      {/* TREND */}
      <ResourceTrendChart
        title={metricType === "cpu" ? "CPU Usage Over Time" : "Memory Usage Over Time"}
        data={metricType === "cpu" ? cpuMetrics.trend : memoryMetrics.trend}
        unit={metricType === "cpu" ? "%" : "GiB"}
        timeRange={timeRange}
        namespace={metricNamespace}
        pod={metricPod}
      />
    </div>
  );
}
