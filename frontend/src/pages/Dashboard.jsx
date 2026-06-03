// ===============================
// src/pages/Dashboard.jsx
// ===============================

import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import ResourceUsageCard from "../components/charts/ResourceUsageCard";
import TopMemoryTrendChart from "../components/charts/TopMemoryTrendChart";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import { useMemo } from "react";
import {
  Layers,
  Boxes,
  Clock,
  Server,
  Cpu,
  MemoryStick,
  AlertTriangle,
  HardDrive,
} from "lucide-react";

const API = "/api";

function getUserNamespaces() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "developer") {
      const arr =
        Array.isArray(user?.team?.namespaces) && user.team.namespaces.length
          ? user.team.namespaces
          : user?.team?.namespace
            ? [user.team.namespace]
            : [];
      return arr;
    }
  } catch {}
  return [];
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const namespaceFilter = getUserNamespaces(); // array; empty = admin sees all
  const navigate = useNavigate();

  const [pods, setPods] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [cronJobs, setCronJobs] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [daemonSets, setDaemonSets] = useState([]);
  const [statefulSets, setStatefulSets] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [trendData, setTrendData] = useState([]);

  const [timeRange, setTimeRange] = useState("1h");

  const top5Deployments = useMemo(() => {
    return [...metrics]
      .sort((a, b) => b.memory - a.memory)
      .slice(0, 5)
      .map((m) => m.deployment);
  }, [metrics]);

  /* ---------------- SAFE FETCH ---------------- */
  useEffect(() => {
    const fetchSafe = async (url, setter) => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) throw new Error("API failed");
        const data = await res.json();
        setter(Array.isArray(data) ? data : []);
      } catch {
        setter([]);
      }
    };

    const fetchAllData = () => {
      const ns = namespaceFilter.length
        ? `?namespace=${encodeURIComponent(namespaceFilter.join(","))}`
        : "";
      Promise.all([
        fetchSafe(`${API}/pods${ns}`, setPods),
        fetchSafe(`${API}/deployments${ns}`, setDeployments),
        fetchSafe(`${API}/jobs${ns}`, setJobs),
        fetchSafe(`${API}/cronjobs${ns}`, setCronJobs),
        fetchSafe(`${API}/daemonsets${ns}`, setDaemonSets),
        fetchSafe(`${API}/statefulsets${ns}`, setStatefulSets),
        fetchSafe(`${API}/pod-metrics${ns}`, setMetrics),
        fetchSafe(`${API}/volumes${ns}`, setVolumes),
      ]).finally(() => setLoading(false));
    };

    // First load
    fetchAllData();

    // 🔥 Auto refresh every 5 seconds
    const interval = setInterval(() => {
      fetchAllData();
    }, 5000);

    // Cleanup when component unmounts
    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
  async function loadTrend() {
    try {
      const res = await fetch(`${API}/metrics-history?range=${timeRange}`);

      if (!res.ok) {
        throw new Error("API failed");
      }

      const data = await res.json();

      const grouped = {};

      data.forEach((d) => {
        const date = new Date(d.timestamp);

        const time =
          timeRange === "7d"
            ? date.toLocaleDateString() + " " + date.getHours() + ":00"
            : date.toLocaleTimeString();

        if (!grouped[time]) grouped[time] = { time };

        grouped[time][d.deployment] = d.memory;
      });

      setTrendData(Object.values(grouped));
    } catch (err) {
      console.error("Trend fetch error:", err);
      setTrendData([]); // prevent crash
    }
  }

  loadTrend();
}, [timeRange]);
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
    { total: 0, successful: 0, inProgress: 0, unsuccessful: 0 },
  );

  const jobStats = jobs.reduce(
    (acc, j) => {
      acc.total++;
      if (j.status?.succeeded) acc.successful++;
      else if (j.status?.failed) acc.unsuccessful++;
      else acc.inProgress++;
      return acc;
    },
    { total: 0, successful: 0, inProgress: 0, unsuccessful: 0 },
  );

  const cronJobStats = cronJobs.reduce(
    (acc, c) => {
      acc.total++;
      if (c.spec?.suspend) acc.unsuccessful++;
      else acc.successful++;
      return acc;
    },
    { total: 0, successful: 0, inProgress: 0, unsuccessful: 0 },
  );

  const daemonSetStats = {
    total: daemonSets.length,
    successful: daemonSets.filter(
      (d) => d.status?.numberReady === d.status?.desiredNumberScheduled,
    ).length,
    inProgress: 0,
    unsuccessful: daemonSets.filter(
      (d) => d.status?.numberReady !== d.status?.desiredNumberScheduled,
    ).length,
  };

  const statefulSetStats = {
    total: statefulSets.length,
    successful: statefulSets.filter(
      (s) => s.status?.readyReplicas === s.spec?.replicas,
    ).length,
    inProgress: 0,
    unsuccessful: statefulSets.filter(
      (s) => s.status?.readyReplicas !== s.spec?.replicas,
    ).length,
  };

  /* ---------------- SAFE NAMESPACES ---------------- */
  // For developers: show their team namespaces count; for admin: derive from pods
  const namespaces = namespaceFilter.length
    ? namespaceFilter
    : [...new Set(pods.map((p) => p.metadata?.namespace).filter(Boolean))];

  /* ---------------- UNHEALTHY PODS ---------------- */
  const unhealthyPods = pods.filter((p) => {
    const phase = p.status?.phase;
    const containerStatuses = p.status?.containerStatuses || [];

    // Explicitly terminal / stuck phases
    if (phase === "Failed" || phase === "Pending" || phase === "Unknown")
      return true;

    // Pod is "Running" but at least one container is not ready
    // This reliably catches CrashLoopBackOff in BOTH its waiting and terminated phases,
    // OOMKilled, ImagePullBackOff, and any other container-level failure.
    if (phase === "Running" && containerStatuses.length > 0) {
      return containerStatuses.some((c) => !c.ready);
    }

    return false;
  });

  /* ---------------- UI COMPONENTS ---------------- */

  const BreakdownCard = ({ title, stats, icon: Icon, tab }) => (
    <Card
      onClick={() => navigate(`/workloads?tab=${tab}`)}
      className="p-5 border border-border shadow-soft hover:shadow-medium hover:border-primary transition bg-surface cursor-pointer group rounded-xl"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-primarySoft text-primary">
          <Icon size={20} />
        </div>
        <h2 className="text-base font-semibold text-text group-hover:text-primary transition">
          {title}
        </h2>
      </div>

      <div className="space-y-1.5 text-sm text-slate-600">
        <div className="flex justify-between">
          <span className="text-slate-400">Healthy</span>
          <span className="font-semibold text-emerald-600">
            {stats.successful}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">In Progress</span>
          <span className="font-semibold text-blue-500">
            {stats.inProgress}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Failed</span>
          <span className="font-semibold text-red-500">
            {stats.unsuccessful}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400">
          Total: <b className="text-slate-600">{stats.total}</b>
        </span>
        <span className="text-xs text-indigo-500 opacity-0 group-hover:opacity-100 transition font-medium">
          View all →
        </span>
      </div>
    </Card>
  );

  const SimpleCard = ({ title, value, icon: Icon, tab }) => (
    <Card
      onClick={() => navigate(`/workloads?tab=${tab}`)}
      className="p-5 border border-border shadow-soft hover:shadow-medium hover:border-primary transition bg-surface cursor-pointer group rounded-xl"
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-primarySoft text-primary shrink-0">
          <Icon size={22} />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-medium text-muted group-hover:text-primary transition">
            {title}
          </h2>
          <div className="text-3xl font-bold mt-0.5 text-text">{value}</div>
        </div>
        <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition font-medium">
          View →
        </span>
      </div>
    </Card>
  );

  /* ---------------- METRICS ---------------- */

  const cpuPie = [...metrics]
    .sort((a, b) => b.cpu - a.cpu)
    .map((p) => ({
      name: p.deployment,
      value: p.cpu,
    }));

  const memPie = [...metrics]
    .sort((a, b) => b.memory - a.memory)
    .map((p) => ({
      name: p.deployment,
      value: p.memory,
    }));

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return <div className="p-6 text-muted">Loading cluster data...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      {/* PAGE TITLE */}
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Left side (you can later add title here if you want) */}
        <div></div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* 🔔 Notification Bell */}
          <NotificationBell alerts={unhealthyPods} />

          
        </div>
      </div>

      

      {/* WORKLOAD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <BreakdownCard
          title="Deployments"
          stats={deploymentStats}
          icon={Layers}
          tab="deployments"
        />
        <BreakdownCard title="Jobs" stats={jobStats} icon={Boxes} tab="jobs" />
        <BreakdownCard
          title="CronJobs"
          stats={cronJobStats}
          icon={Clock}
          tab="cronjobs"
        />
        <BreakdownCard
          title="DaemonSets"
          stats={daemonSetStats}
          icon={Server}
          tab="daemonsets"
        />
        <BreakdownCard
          title="StatefulSets"
          stats={statefulSetStats}
          icon={Layers}
          tab="statefulsets"
        />
      </div>

      {/* CLUSTER SUMMARY */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">
          Cluster Summary
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <SimpleCard
            title="Namespaces"
            value={namespaces.length}
            icon={Server}
            tab="namespaces"
          />
          <SimpleCard
            title="Pods"
            value={pods.length}
            icon={Boxes}
            tab="pods"
          />

          {/* Volumes widget */}
          <Card
            onClick={() => navigate("/workloads?tab=volumes")}
            className="p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition bg-white rounded-xl group cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                <HardDrive size={20} />
              </div>
              <h2 className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition">
                Persistent Volumes
              </h2>
              <span className="ml-auto text-3xl font-bold text-slate-900">
                {volumes.length}
              </span>
            </div>

            <div className="space-y-1.5 text-sm">
              {[
                {
                  label: "Bound",
                  color: "text-emerald-600",
                  count: volumes.filter((v) => v.phase === "Bound").length,
                },
                {
                  label: "Available",
                  color: "text-blue-500",
                  count: volumes.filter((v) => v.phase === "Available").length,
                },
                {
                  label: "Released",
                  color: "text-amber-500",
                  count: volumes.filter((v) => v.phase === "Released").length,
                },
                {
                  label: "Failed",
                  color: "text-red-500",
                  count: volumes.filter((v) => v.phase === "Failed").length,
                },
              ].map(
                ({ label, color, count }) =>
                  count > 0 && (
                    <div key={label} className="flex justify-between">
                      <span className="text-slate-400">{label}</span>
                      <span className={`font-semibold ${color}`}>{count}</span>
                    </div>
                  ),
              )}
              {volumes.length === 0 && (
                <p className="text-xs text-slate-400 italic">
                  No volumes found
                </p>
              )}
            </div>

            {volumes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex gap-1 flex-wrap">
                  {volumes.slice(0, 4).map((v) => (
                    <span
                      key={v.name}
                      className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono truncate max-w-[110px]"
                      title={`${v.name} · ${v.capacity} · ${v.phase}`}
                    >
                      {v.name}
                    </span>
                  ))}
                  {volumes.length > 4 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                      +{volumes.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-3 pt-2 border-t border-slate-100">
              <span className="text-xs text-indigo-500 opacity-0 group-hover:opacity-100 transition font-medium">
                View →
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* PERFORMANCE METRICS */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">
          Cluster Performance
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ResourceUsageCard
            title={
              <span className="flex items-center gap-2">
                <Cpu size={15} className="text-blue-500" /> CPU Usage by
                Workload
              </span>
            }
            pieData={cpuPie}
            unit="cpu"
          />
          <ResourceUsageCard
            title={
              <span className="flex items-center gap-2">
                <MemoryStick size={15} className="text-violet-500" /> Memory
                Usage by Workload
              </span>
            }
            pieData={memPie}
            unit="memory"
          />
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text">Memory Trends</h2>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm border border-border rounded-md px-3 py-1 bg-surface"
          >
            <option value="1h">Last 1 Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>

        <TopMemoryTrendChart data={trendData} deployments={top5Deployments} />
      </div>

      
    </div>
  );
}
