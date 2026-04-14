// ===============================
// src/pages/Dashboard.jsx
// ===============================

import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import ResourceUsageCard from "../components/charts/ResourceUsageCard";
import { useNavigate } from "react-router-dom";
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

const API = "http://127.0.0.1:5000/api";

function getUserNamespaces() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "developer") {
      const arr = Array.isArray(user?.team?.namespaces) && user.team.namespaces.length
        ? user.team.namespaces
        : user?.team?.namespace ? [user.team.namespace] : [];
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
      const ns = namespaceFilter.length ? `?namespace=${encodeURIComponent(namespaceFilter.join(","))}` : "";
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

const daemonSetStats = {
  total: daemonSets.length,
  successful: daemonSets.filter(d => d.status?.numberReady === d.status?.desiredNumberScheduled).length,
  inProgress: 0,
  unsuccessful: daemonSets.filter(d => d.status?.numberReady !== d.status?.desiredNumberScheduled).length,
};

const statefulSetStats = {
  total: statefulSets.length,
  successful: statefulSets.filter(s => s.status?.readyReplicas === s.spec?.replicas).length,
  inProgress: 0,
  unsuccessful: statefulSets.filter(s => s.status?.readyReplicas !== s.spec?.replicas).length,
};

  /* ---------------- SAFE NAMESPACES ---------------- */
  // For developers: show their team namespaces count; for admin: derive from pods
  const namespaces = namespaceFilter.length
    ? namespaceFilter
    : [...new Set(pods.map(p => p.metadata?.namespace).filter(Boolean))];

  /* ---------------- UNHEALTHY PODS ---------------- */
  const unhealthyPods = pods.filter(p => {
    const phase = p.status?.phase;
    const containerStatuses = p.status?.containerStatuses || [];

    // Explicitly terminal / stuck phases
    if (phase === "Failed" || phase === "Pending" || phase === "Unknown") return true;

    // Pod is "Running" but at least one container is not ready
    // This reliably catches CrashLoopBackOff in BOTH its waiting and terminated phases,
    // OOMKilled, ImagePullBackOff, and any other container-level failure.
    if (phase === "Running" && containerStatuses.length > 0) {
      return containerStatuses.some(c => !c.ready);
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
         <h2 className="text-base font-semibold text-text group-hover:text-primary transition">{title}</h2>
       </div>

      <div className="space-y-1.5 text-sm text-slate-600">
        <div className="flex justify-between">
          <span className="text-slate-400">Healthy</span>
          <span className="font-semibold text-emerald-600">{stats.successful}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">In Progress</span>
          <span className="font-semibold text-blue-500">{stats.inProgress}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Failed</span>
          <span className="font-semibold text-red-500">{stats.unsuccessful}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400">Total: <b className="text-slate-600">{stats.total}</b></span>
        <span className="text-xs text-indigo-500 opacity-0 group-hover:opacity-100 transition font-medium">View all →</span>
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
          <h2 className="text-sm font-medium text-muted group-hover:text-primary transition">{title}</h2>
          <div className="text-3xl font-bold mt-0.5 text-text">{value}</div>
        </div>
        <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition font-medium">View →</span>
      </div>
    </Card>
  );

  /* ---------------- METRICS ---------------- */

  const cpuPie = [...metrics]
  .sort((a, b) => b.cpu - a.cpu)
  .map(p => ({
    name: p.deployment,
    value: p.cpu
  }));

const memPie = [...metrics]
  .sort((a, b) => b.memory - a.memory)
  .map(p => ({
    name: p.deployment,
    value: p.memory
  }));

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return (
      <div className="p-6 text-muted">
        Loading cluster data...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">

      {/* PAGE TITLE */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
        </div>
        {namespaceFilter.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {namespaceFilter.map(ns => (
              <span key={ns} className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                {ns}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* WORKLOAD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <BreakdownCard title="Deployments"  stats={deploymentStats}  icon={Layers} tab="deployments" />
        <BreakdownCard title="Jobs"         stats={jobStats}         icon={Boxes}  tab="jobs" />
        <BreakdownCard title="CronJobs"     stats={cronJobStats}     icon={Clock}  tab="cronjobs" />
        <BreakdownCard title="DaemonSets"   stats={daemonSetStats}   icon={Server} tab="daemonsets" />
        <BreakdownCard title="StatefulSets" stats={statefulSetStats} icon={Layers} tab="statefulsets" />
      </div>

      {/* UNHEALTHY PODS PANEL */}
      {unhealthyPods.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            Attention Required
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
              {unhealthyPods.length}
            </span>
          </h2>
          <div className="rounded-xl border border-red-200 bg-red-50/40 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
                <thead>
                <tr className="bg-red-100/60 text-xs font-semibold text-red-700 uppercase tracking-wide text-left">
                  <th className="px-4 py-3">Pod</th>
                  <th className="px-4 py-3">Namespace</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Restarts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {unhealthyPods.map((p, i) => {
                  const cs = p.status?.containerStatuses?.find(c => !c.ready) || p.status?.containerStatuses?.[0];
                  const containerReason =
                    cs?.state?.waiting?.reason ||
                    cs?.state?.terminated?.reason ||
                    null;
                  // Show the container-level reason as the effective status; fall back to pod phase
                  const effectiveStatus = containerReason || p.status?.phase || "Unknown";
                  const restarts = (p.status?.containerStatuses || [])
                    .reduce((s, c) => s + (c.restartCount || 0), 0);

                  const statusColor =
                    ["CrashLoopBackOff", "OOMKilled", "Error"].includes(effectiveStatus)
                      ? "bg-red-200 text-red-800"
                      : ["ImagePullBackOff", "ErrImagePull", "CreateContainerConfigError"].includes(effectiveStatus)
                      ? "bg-orange-200 text-orange-800"
                      : effectiveStatus === "Pending"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-red-200 text-red-800";

                  return (
                    <tr key={i} className="hover:bg-red-50 transition">
                      <td className="px-4 py-3 font-mono text-xs text-gray-800">{p.metadata?.name}</td>
                      <td className="px-4 py-3 text-gray-600">{p.metadata?.namespace}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                          {effectiveStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{restarts > 0 ? <span className="font-semibold text-red-600">{restarts}×</span> : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-2.5 border-t border-red-100 bg-white text-xs text-right">
              <button
                onClick={() => navigate("/events")}
                className="text-indigo-600 hover:text-indigo-800 font-medium bg-transparent border-none hover:underline transition"
              >
                View cluster events →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLUSTER SUMMARY */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">
          Cluster Summary
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <SimpleCard title="Namespaces" value={namespaces.length} icon={Server} tab="namespaces" />
          <SimpleCard title="Pods"       value={pods.length}       icon={Boxes}  tab="pods" />

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
              <span className="ml-auto text-3xl font-bold text-slate-900">{volumes.length}</span>
            </div>

            <div className="space-y-1.5 text-sm">
              {[
                { label: "Bound",     color: "text-emerald-600", count: volumes.filter(v => v.phase === "Bound").length },
                { label: "Available", color: "text-blue-500",    count: volumes.filter(v => v.phase === "Available").length },
                { label: "Released",  color: "text-amber-500",   count: volumes.filter(v => v.phase === "Released").length },
                { label: "Failed",    color: "text-red-500",     count: volumes.filter(v => v.phase === "Failed").length },
              ].map(({ label, color, count }) => count > 0 && (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-400">{label}</span>
                  <span className={`font-semibold ${color}`}>{count}</span>
                </div>
              ))}
              {volumes.length === 0 && (
                <p className="text-xs text-slate-400 italic">No volumes found</p>
              )}
            </div>

            {volumes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex gap-1 flex-wrap">
                  {volumes.slice(0, 4).map(v => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResourceUsageCard
            title={<span className="flex items-center gap-2"><Cpu size={15} className="text-blue-500" /> CPU Usage by Workload</span>}
            pieData={cpuPie}
            unit="cpu"
          />
          <ResourceUsageCard
            title={<span className="flex items-center gap-2"><MemoryStick size={15} className="text-violet-500" /> Memory Usage by Workload</span>}
            pieData={memPie}
            unit="memory"
          />
        </div>
      </div>

    </div>
  );
}