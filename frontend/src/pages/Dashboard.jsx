// src/pages/Dashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Card } from "../components/ui/card";
import { Tabs } from "../components/ui/tabs";
import { CheckCircle, Clock, RefreshCcw } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [namespace, setNamespace] = useState("all");
  const [status, setStatus] = useState("all");
  const [timeRange, setTimeRange] = useState("24h");

  const cronJobs = [
    {
      name: "backup-database",
      namespace: "production",
      schedule: "0 2 * * *",
      lastRun: "3 hours ago",
      successRate: "28/30 (93%)",
      active: true,
    },
  ];

  const jobs = [
    {
      name: "backup-database-1733234520",
      namespace: "production",
      duration: "2m 15s",
      status: "Succeeded",
    },
    {
      name: "data-migration-manual",
      namespace: "default",
      duration: "N/A",
      status: "Running",
      progress: "2/5 completions",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><div className="font-bold text-lg">Total Jobs</div><div className="text-2xl">45</div></Card>
        <Card><div className="font-bold text-lg">Active Jobs</div><div className="text-2xl">8</div></Card>
        <Card><div className="font-bold text-lg">Succeeded Jobs</div><div className="text-2xl">32</div></Card>
        <Card><div className="font-bold text-lg">Failed Jobs</div><div className="text-2xl text-red-500">5</div></Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><div className="font-bold text-lg">Total CronJobs</div><div className="text-2xl">12</div></Card>
        <Card><div className="font-bold text-lg">Active CronJobs</div><div className="text-2xl">10</div></Card>
        <Card><div className="font-bold text-lg">Suspended CronJobs</div><div className="text-2xl">2</div></Card>
        <Card><div className="font-bold text-lg">Last Run</div><div className="text-2xl">2m ago</div></Card>
      </div>

      {/* Filter Bar */}
      <Card className="flex flex-col md:flex-row md:items-end gap-4">
        <Input placeholder="Search Jobs / CronJobs" className="md:w-1/3" />
        <Select value={namespace} onChange={(e)=>setNamespace(e.target.value)} className="md:w-1/4">
          <option value="all">All Namespaces</option>
          <option value="production">Production</option>
          <option value="default">Default</option>
        </Select>
        <Select value={status} onChange={(e)=>setStatus(e.target.value)} className="md:w-1/4">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="failed">Failed</option>
          <option value="succeeded">Succeeded</option>
        </Select>
        <Select value={timeRange} onChange={(e)=>setTimeRange(e.target.value)} className="md:w-1/4">
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </Select>
        <Button>Apply</Button>
      </Card>

      {/* Tabs */}
      <Tabs
        defaultTab={0}
        tabs={[
          {
            label: "CronJobs",
            content: (
              <div className="space-y-4">
                {cronJobs.map(cron => (
                  <Card key={cron.name}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-lg">
                        <Clock className="w-5 h-5 text-blue-500" />
                        {cron.name}
                      </div>
                      <div className="text-sm text-green-600">{cron.active ? "Active" : "Suspended"}</div>
                    </div>
                    <div className="text-sm mt-1">Namespace: {cron.namespace} | Schedule: {cron.schedule}</div>
                    <div className="text-sm mt-1">Last Run: {cron.lastRun} | Success Rate: {cron.successRate}</div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Button onClick={()=>navigate(`/job/${cron.name}`)}>View Details</Button>
                      <Button>View Logs</Button>
                      <Button>Suspend</Button>
                      <Button className="bg-red-500 hover:bg-red-600">Delete</Button>
                    </div>
                  </Card>
                ))}
              </div>
            ),
          },
          {
            label: "Jobs",
            content: (
              <div className="space-y-4">
                {jobs.map(job => (
                  <Card key={job.name}>
                    <div className="flex items-center gap-2 font-bold text-lg">
                      {job.status==="Succeeded" && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {job.status==="Running" && <RefreshCcw className="w-5 h-5 text-yellow-500 animate-spin" />}
                      {job.name}
                    </div>
                    <div className="text-sm mt-1">Namespace: {job.namespace} | Duration: {job.duration}</div>
                    {job.progress && <div className="text-sm mt-1">Progress: {job.progress}</div>}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Button onClick={()=>navigate(`/job/${job.name}`)}>View Details</Button>
                      <Button>View Logs</Button>
                      <Button>View YAML</Button>
                    </div>
                  </Card>
                ))}
              </div>
            ),
          },
          { label: "All Resources", content: <div>Coming Soon...</div> },
        ]}
      />
    </div>
  );
}
