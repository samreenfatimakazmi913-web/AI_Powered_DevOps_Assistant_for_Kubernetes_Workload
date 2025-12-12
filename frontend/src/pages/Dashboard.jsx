// src/pages/Dashboard.jsx
import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import CpuUsageChart from "../components/charts/CpuUsageChart";
import MemoryUsageChart from "../components/charts/MemoryUsageChart";

export default function Dashboard() {
  // Dummy values
  const data = {
    deployments: { total: 6, successful: 2, inProgress: 3, unsuccessful: 1 },
    statefulSets: { total: 8, successful: 5, inProgress: 2, unsuccessful: 1 },
    daemonSets: { total: 4, successful: 3, inProgress: 1, unsuccessful: 0 },
    jobs: { total: 12, successful: 9, inProgress: 2, unsuccessful: 1 },
    cronJobs: { total: 5, successful: 3, inProgress: 1, unsuccessful: 1 },
    namespaces: 7,
    volumes: 4,
  };

  // Fixed color mapping for Tailwind
  const colorMap = {
    green: "text-green-600",
    yellow: "text-yellow-500",
    red: "text-red-600",
  };

  const Breakdown = ({ label, value, color }) => (
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span className={`font-semibold ${colorMap[color]}`}>{value}</span>
    </div>
  );

  const BreakdownCard = ({ title, stats }) => (
    <Card className="p-5 shadow-sm hover:shadow-md transition-all">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>

      <div className="space-y-1 mb-3">
        <Breakdown label="Successful" value={stats.successful} color="green" />
        <Breakdown label="In Progress" value={stats.inProgress} color="yellow" />
        <Breakdown label="Unsuccessful" value={stats.unsuccessful} color="red" />
      </div>

      <div className="text-right text-gray-600 text-sm">
        Total: <span className="font-semibold">{stats.total}</span>
      </div>
    </Card>
  );

  const SimpleCard = ({ title, value }) => (
    <Card className="p-5 shadow-sm hover:shadow-md transition-all">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </Card>
  );

  return (
    <div className="p-6 space-y-8">
      
      {/* Section Title */}
      <h1 className="text-3xl font-bold">Workload Health</h1>

      {/* Grid for Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <BreakdownCard title="Deployments" stats={data.deployments} />
        <BreakdownCard title="StatefulSets" stats={data.statefulSets} />
        <BreakdownCard title="DaemonSets" stats={data.daemonSets} />
        <BreakdownCard title="Jobs" stats={data.jobs} />
        <BreakdownCard title="CronJobs" stats={data.cronJobs} />
      </div>

      {/* Simple Cards Section */}
      <h1 className="text-2xl font-semibold mt-10">Cluster Summary</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <SimpleCard title="Namespaces" value={data.namespaces} />
        <SimpleCard title="Volumes" value={data.volumes} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <CpuUsageChart />
        <MemoryUsageChart />
      </div>
    </div>
  );
}
