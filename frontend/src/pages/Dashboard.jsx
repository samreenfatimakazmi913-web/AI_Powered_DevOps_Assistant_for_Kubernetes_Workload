// ===============================
// src/pages/Dashboard.jsx
// ===============================

import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import ResourceUsageCard from "../components/charts/ResourceUsageCard";


const API = "http://127.0.0.1:5000/api";

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
      } catch (err) {
        console.error("❌ API ERROR:", url, err.message);
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

  /* ---------------- DEPLOYMENT STATS ---------------- */

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

  /* ---------------- JOB STATS ---------------- */

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

  /* ---------------- CRONJOB STATS ---------------- */

  const cronJobStats = cronJobs.reduce(
    (acc, c) => {
      acc.total++;
      if (c.spec?.suspend) acc.unsuccessful++;
      else acc.successful++;
      return acc;
    },
    { total: 0, successful: 0, inProgress: 0, unsuccessful: 0 }
  );

  /* ---------------- CLUSTER SUMMARY ---------------- */

  const namespaces = new Set(pods.map(p => p.metadata?.namespace));

  /* ---------------- UI COMPONENTS ---------------- */

  const BreakdownCard = ({ title, stats }) => (
    <Card className="p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Successful</span>
          <span className="text-green-600 font-semibold">{stats.successful}</span>
        </div>
        <div className="flex justify-between">
          <span>In Progress</span>
          <span className="text-yellow-500 font-semibold">{stats.inProgress}</span>
        </div>
        <div className="flex justify-between">
          <span>Failed</span>
          <span className="text-red-600 font-semibold">{stats.unsuccessful}</span>
        </div>
      </div>
      <div className="text-right text-sm text-gray-500 mt-2">
        Total: <b>{stats.total}</b>
      </div>
    </Card>
  );

  const SimpleCard = ({ title, value }) => (
    <Card className="p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </Card>
  );

  // ---------------- TEMP DUMMY METRICS ----------------

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
    return <div className="p-6 text-gray-500">Loading cluster data...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Workload Health</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BreakdownCard title="Deployments" stats={deploymentStats} />
        <BreakdownCard title="Jobs" stats={jobStats} />
        <BreakdownCard title="CronJobs" stats={cronJobStats} />
      </div>

      <h1 className="text-2xl font-semibold mt-10">Cluster Summary</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SimpleCard title="Namespaces" value={namespaces.size} />
        <SimpleCard title="Pods" value={pods.length} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

  <ResourceUsageCard
    title="CPU Usage"
    pieData={cpuPie}
    lineData={cpuLine}
    lineColor="#22C55E"
    unit=""
  />

  <ResourceUsageCard
    title="Memory Usage"
    pieData={memPie}
    lineData={memLine}
    lineColor="#3B82F6"
    unit="MB"
  />

</div>




    </div>
  );
}
