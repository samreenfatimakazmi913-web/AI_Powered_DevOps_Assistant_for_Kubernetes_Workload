// src/pages/StructuredQuerying.jsx
import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Select } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Mock data
const namespaces = ["dev", "staging", "prod"];
const podsByNamespace = {
  dev: ["dev-pod-1", "dev-service-abc"],
  staging: ["stg-worker-1", "stg-api-22"],
  prod: ["prod-billing-01", "prod-search-02"],
};

const cpuData = [
  { time: "10:00", cpu: 30 },
  { time: "10:10", cpu: 50 },
  { time: "10:20", cpu: 65 },
  { time: "10:30", cpu: 62 },
  { time: "10:40", cpu: 55 },
];

export default function StructuredQuerying() {
  const [namespace, setNamespace] = useState("");
  const [pod, setPod] = useState("");
  const [pods, setPods] = useState([]);
  const [logs, setLogs] = useState("Logs will appear here...");
  const [tailing, setTailing] = useState(true);

  // Fetch pods when namespace changes
  useEffect(() => {
    setPods(podsByNamespace[namespace] || []);
    setPod("");
  }, [namespace]);

  // Simulate log tailing
  useEffect(() => {
    if (!tailing) return;
    const interval = setInterval(() => {
      setLogs((prev) => prev + `New log at ${new Date().toLocaleTimeString()}\n`);
    }, 3000);
    return () => clearInterval(interval);
  }, [tailing]);

  const fetchLogs = () => {
    setLogs(
      `16:01:23 INFO Starting container...\n16:01:24 INFO Connecting to DB...\n16:01:30 ERROR Timeout occurred...\n16:01:32 WARN Retrying...\n`
    );
  };

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-3xl font-bold">Structured Querying</h1>

      {/* Filters */}
      <Card className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex flex-col w-52">
          <label className="text-sm text-gray-600 mb-1">Namespace</label>
          <Select value={namespace} onChange={(e) => setNamespace(e.target.value)}>
            <option value="">Select namespace</option>
            {namespaces.map((ns) => <option key={ns} value={ns}>{ns}</option>)}
          </Select>
        </div>

        <div className="flex flex-col w-64">
          <label className="text-sm text-gray-600 mb-1">Pod</label>
          <Select disabled={!namespace} value={pod} onChange={(e) => setPod(e.target.value)}>
            <option value="">Select pod</option>
            {pods.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
        </div>

        <Button onClick={fetchLogs} disabled={!namespace || !pod}>▶ Fetch Logs</Button>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Logs Panel */}
        <Card className="col-span-1 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-lg">Logs</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm">Tail:</span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={tailing}
                  onChange={() => setTailing(!tailing)}
                />
                <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-600 relative peer">
                  <span className="absolute top-0.5 left-0.5 peer-checked:left-5 w-4 h-4 bg-white rounded-full shadow transition-all"></span>
                </div>
              </label>
            </div>
          </div>
          <pre className="bg-[#0D1117] text-gray-200 p-4 h-[400px] overflow-auto rounded-xl font-mono text-sm">
            {logs}
          </pre>
        </Card>

        {/* Metrics Panel */}
        <Card>
          <h2 className="font-semibold text-lg mb-3">CPU Usage</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={cpuData}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cpu" stroke="#0F62FE" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Health Panel */}
        <Card>
          <h2 className="font-semibold text-lg mb-3">Cluster Health</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span>Node-1</span>
              <span className="text-green-500 font-semibold">Ready</span>
            </li>
            <li className="flex justify-between">
              <span>Node-2</span>
              <span className="text-green-500 font-semibold">Ready</span>
            </li>
            <li className="flex justify-between">
              <span>Node-3</span>
              <span className="text-red-500 font-semibold">NotReady</span>
            </li>
          </ul>
        </Card>

      </div>
    </div>
  );
}
