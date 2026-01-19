// ===============================
// src/pages/StructuredQuerying.jsx
// ===============================

import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Select } from "../components/ui/select";
import { Button } from "../components/ui/button";
import {
  Wrench,
  FileText,
  Activity,
  Database,
  TerminalSquare,
  Cpu,
  HardDrive,
  ListTree
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ---------------- TOOLS ---------------- */

const troubleshootTools = [
  { name: "NC", cmd: "$ nc -vz service 443" },
  { name: "Curl", cmd: "$ curl service:80" },
  {
    name: "Netshoot",
    cmd: `$ curl service:80
$ nc -vz service 443
$ dig service`,
  },
];

/* ---------------- MOCK METRICS ---------------- */

const cpuData = [
  { time: "10:00", value: 0.32 },
  { time: "10:10", value: 0.45 },
  { time: "10:20", value: 0.61 },
  { time: "10:30", value: 0.58 },
];

const memoryData = [
  { time: "10:00", value: 420 },
  { time: "10:10", value: 510 },
  { time: "10:20", value: 630 },
  { time: "10:30", value: 600 },
];

const requestData = [
  { time: "10:00", value: 120 },
  { time: "10:10", value: 240 },
  { time: "10:20", value: 180 },
  { time: "10:30", value: 300 },
];

export default function StructuredQuerying() {
  const [tab, setTab] = useState("troubleshoot");

  const [namespaces, setNamespaces] = useState([]);
  const [pods, setPods] = useState([]);

  const [namespace, setNamespace] = useState("");
  const [pod, setPod] = useState("");
  const [tool, setTool] = useState("");

  const [terminal, setTerminal] = useState("");
  const [logs, setLogs] = useState("Logs will appear here...\n");

  const [showMetrics, setShowMetrics] = useState(false);

  /* ---------------- FETCH NAMESPACES ---------------- */

  useEffect(() => {
    fetch("http://localhost:5000/api/pods")
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const uniqueNs = [
          ...new Set(
            data
              .filter(p => p?.metadata?.namespace)
              .map(p => p.metadata.namespace)
          ),
        ];
        setNamespaces(uniqueNs);
      });
  }, []);

  /* ---------------- FETCH PODS ---------------- */

  useEffect(() => {
    if (!namespace) return;
    fetch("http://localhost:5000/api/pods")
      .then(res => res.json())
      .then(data => {
        const filtered = data
          .filter(p => p.metadata.namespace === namespace)
          .map(p => p.metadata.name);
        setPods(filtered);
      });
  }, [namespace]);

  /* ---------------- TOOL → TERMINAL ---------------- */

  useEffect(() => {
    const selected = troubleshootTools.find(t => t.name === tool);
    if (selected && namespace) {
      setTerminal(
`$ kubectl run debug --image=${tool.toLowerCase()} -n ${namespace}
${selected.cmd}`
      );
    }
  }, [tool, namespace]);

  /* ---------------- FETCH LOGS ---------------- */

  const fetchLogs = async () => {
    if (!namespace || !pod) return;
    setLogs("Fetching logs...\n");
    const res = await fetch(`http://localhost:5000/api/logs/${namespace}/${pod}`);
    const text = await res.text();
    setLogs(text || "No logs available");
  };

  return (
    <div className="flex flex-col min-h-screen p-6 space-y-8 bg-gray-50">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-[#8B0000]/10 text-[#8B0000]">
          <ListTree size={26} />
        </div>
        <h1 className="text-3xl font-bold">Structured Querying</h1>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b pb-3">
        {[
          ["troubleshoot", "Troubleshooting", Wrench],
          ["logs", "Logs", FileText],
          ["metrics", "Metrics", Activity],
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition
              ${
                tab === key
                  ? "bg-[#8B0000]/10 text-[#8B0000] border border-[#8B0000]/30"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
          >
            <Icon size={16} className="text-[#8B0000]" />
            {label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="flex-1">

        {/* TROUBLESHOOT */}
        {tab === "troubleshoot" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <h2 className="font-semibold mb-2 flex items-center gap-2">
                <Database size={16} className="text-[#8B0000]" />
                Namespace
              </h2>
              <Select value={namespace} onChange={e => setNamespace(e.target.value)}>
                <option value="">Select Namespace</option>
                {namespaces.map(ns => <option key={ns}>{ns}</option>)}
              </Select>
            </Card>

            <Card>
              <h2 className="font-semibold mb-2 flex items-center gap-2">
                <TerminalSquare size={16} className="text-[#8B0000]" />
                Tool
              </h2>
              <Select value={tool} onChange={e => setTool(e.target.value)}>
                <option value="">Select Tool</option>
                {troubleshootTools.map(t => <option key={t.name}>{t.name}</option>)}
              </Select>
            </Card>

            {tool && (
              <Card className="lg:col-span-3">
                <pre className="bg-gray-900 text-[#EFCD23] p-4 rounded text-sm overflow-auto">
                  {terminal}
                </pre>
              </Card>
            )}
          </div>
        )}

        {/* LOGS */}
        {tab === "logs" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <Select value={namespace} onChange={e => setNamespace(e.target.value)}>
                  <option value="">Select Namespace</option>
                  {namespaces.map(ns => <option key={ns}>{ns}</option>)}
                </Select>
              </Card>

              <Card>
                <Select value={pod} onChange={e => setPod(e.target.value)}>
                  <option value="">Select Pod</option>
                  {pods.map(p => <option key={p}>{p}</option>)}
                </Select>
              </Card>

              <Button
                onClick={fetchLogs}
                disabled={!pod}
                className="bg-[#8B0000] hover:bg-[#a00000] text-white"
              >
                Fetch Logs
              </Button>
            </div>

            <Card>
              <pre className="bg-gray-900 text-gray-200 p-4 min-h-[40vh] rounded overflow-auto">
                {logs}
              </pre>
            </Card>
          </div>
        )}

        {/* METRICS */}
        {tab === "metrics" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <Select value={namespace} onChange={e => setNamespace(e.target.value)}>
                  <option value="">Select Namespace</option>
                  {namespaces.map(ns => <option key={ns}>{ns}</option>)}
                </Select>
              </Card>

              <Card>
                <Select value={pod} onChange={e => setPod(e.target.value)}>
                  <option value="">Select Pod</option>
                  {pods.map(p => <option key={p}>{p}</option>)}
                </Select>
              </Card>

              <Button
                onClick={() => setShowMetrics(true)}
                className="bg-[#8B0000] hover:bg-[#a00000] text-white"
              >
                Show Metrics
              </Button>
            </div>

            {showMetrics && (
              <div className="space-y-6">
                {[
                  ["CPU Usage", cpuData, Cpu],
                  ["Memory Usage", memoryData, HardDrive],
                  ["Requests", requestData, Activity],
                ].map(([title, data, Icon]) => (
                  <Card key={title}>
                    <h2 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon size={16} className="text-[#8B0000]" />
                      {title}
                    </h2>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={data}>
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          dataKey="value"
                          stroke="#8B0000"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
