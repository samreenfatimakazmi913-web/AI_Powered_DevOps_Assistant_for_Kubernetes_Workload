// ===============================
// src/pages/Dashboard.jsx
// ===============================

import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import ResourceUsageCard from "../components/charts/ResourceUsageCard";
import ResourceUsageSection from "../components/resource-usage/ResourceUsageSection";

import {
  Layers,
  Boxes,
  Clock,
  Server,
  Cpu,
  MemoryStick,
} from "lucide-react";

const API = "http://127.0.0.1:5000/api";
const RED = "#8B0000";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  const [pods, setPods] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [cronJobs, setCronJobs] = useState([]);

  /* ---------------- SAFE FETCH ---------------- */
  useEffect(() => {
    const fetchSafe = async (url, setter) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("API failed");
        const data = await res.json();
        setter(Array.isArray(data) ? data : []);
      } catch {
        setter([]);
      }
    };

    Promise.all([
      fetchSafe(`${API}/pods`, setPods),
      fetchSafe(`${API}/deployments`, setDeployments),
      fetchSafe(`${API}/jobs`, setJobs),
      fetchSafe(`${API}/cronjobs`, setCronJobs),
    ]).finally(() => setLoading(false));
  }, []);

  /* ---------------- STATS ---------------- */

  const deploymentStats = deployments.reduce(
    (acc, d) => {
      acc.total++;
      const replicas = d.spec?.replicas || 0;
      const ready = d.status?.readyReplicas || 0;

      if (replicas > 0 && ready === replicas) acc.successful++;
      else if (ready > 0) acc.inProgress++;
      else acc.unsuccessful++;

      return acc;
    },
    { total: 0, successful: 0, inProgress: 0, unsuccessful: 0 }
  );

  const jobStats = jobs.reduce(
    (acc, j) => {
      acc.total++;
      if (j.status?.succeeded) acc.successful++;
      else if (j.status?.failed) acc.unsuccessful++;
      else acc.inProgress++;
      return acc;
    },
    { total: 0, successful: 0, inProgress: 0, unsuccessful: 0 }
  );

  const cronJobStats = cronJobs.reduce(
    (acc, c) => {
      acc.total++;
      if (c.spec?.suspend) acc.unsuccessful++;
      else acc.successful++;
      return acc;
    },
    { total: 0, successful: 0, inProgress: 0, unsuccessful: 0 }
  );

  /* ---------------- SAFE NAMESPACES ---------------- */
  const namespaces = [
    ...new Set(pods.map(p => p.metadata?.namespace).filter(Boolean))
  ];

  /* ---------------- UI COMPONENTS ---------------- */

  const BreakdownCard = ({ title, stats, icon: Icon }) => (
    <Card className="p-5 border border-black/10 shadow-sm hover:shadow-md transition bg-white">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-md bg-[#8B0000]/10 text-[#8B0000]">
          <Icon size={20} />
        </div>
        <h2 className="text-lg font-semibold text-black">{title}</h2>
      </div>

      <div className="space-y-1 text-sm text-black">
        <div className="flex justify-between">
          <span>Successful</span>
          <span className="font-semibold">{stats.successful}</span>
        </div>
        <div className="flex justify-between">
          <span>In Progress</span>
          <span className="font-semibold">{stats.inProgress}</span>
        </div>
        <div className="flex justify-between">
          <span>Failed</span>
          <span className="font-semibold">{stats.unsuccessful}</span>
        </div>
      </div>

      <div className="text-right text-xs text-[#7f7f7f] mt-2">
        Total: <b>{stats.total}</b>
      </div>
    </Card>
  );

  const SimpleCard = ({ title, value, icon: Icon }) => (
    <Card className="p-5 border border-black/10 shadow-sm hover:shadow-md transition bg-white">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-[#8B0000]/10 text-[#8B0000]">
          <Icon size={22} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-black">{title}</h2>
          <div className="text-3xl font-bold mt-1 text-black">{value}</div>
        </div>
      </div>
    </Card>
  );

  /* ---------------- TEMP METRICS ---------------- */

  const cpuPie = [
    { name: "Used", value: 65 },
    { name: "Free", value: 35 },
  ];

  const cpuLine = [
    { time: "10:00", value: 0.3 },
    { time: "10:10", value: 0.45 },
    { time: "10:20", value: 0.6 },
    { time: "10:30", value: 0.55 },
  ];

  const memPie = [
    { name: "Used", value: 70 },
    { name: "Free", value: 30 },
  ];

  const memLine = [
    { time: "10:00", value: 420 },
    { time: "10:10", value: 500 },
    { time: "10:20", value: 640 },
    { time: "10:30", value: 600 },
  ];

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return (
      <div className="p-6 text-[#7f7f7f]">
        Loading cluster data...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-white min-h-screen">

      <h1 className="text-3xl font-bold text-black">
        Executive Dashboard
      </h1>

      {/* Workloads */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BreakdownCard title="Deployments" stats={deploymentStats} icon={Layers} />
        <BreakdownCard title="Jobs" stats={jobStats} icon={Boxes} />
        <BreakdownCard title="CronJobs" stats={cronJobStats} icon={Clock} />
      </div>

      {/* Summary */}
      <h2 className="text-2xl font-semibold text-black mt-6">
        Cluster Summary
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <SimpleCard title="Namespaces" value={namespaces.length} icon={Server} />
        <SimpleCard title="Pods" value={pods.length} icon={Boxes} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ResourceUsageCard
          title={<span className="flex items-center gap-2">
            <Cpu size={18} className="text-[#8B0000]" /> CPU Usage
          </span>}
          pieData={cpuPie}
          lineData={cpuLine}
          lineColor={RED}
          unit=""
        />

        <ResourceUsageCard
          title={<span className="flex items-center gap-2">
            <MemoryStick size={18} className="text-[#8B0000]" /> Memory Usage
          </span>}
          pieData={memPie}
          lineData={memLine}
          lineColor={RED}
          unit="MB"
        />
      </div>

      {/* RESOURCE USAGE (ADVANCED) */}
      <div>
        <h2 className="text-lg sm:text-2xl font-semibold mb-4">
          Resource Usage
        </h2>

        <ResourceUsageSection
          pods={pods}
          namespaces={namespaces}
        />
      </div>

    </div>
  );
}
