// ===============================
// src/pages/StructuredQuerying.jsx
// ===============================

import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Select } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Play } from "lucide-react";
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

  /* ---------------- FETCH NAMESPACES ---------------- */

  useEffect(() => {
    fetch("http://localhost:5000/api/pods")
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          console.error("Pods API did not return array:", data);
          setNamespaces([]);
          return;
        }

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
    const res = await fetch(
      `http://localhost:5000/api/logs/${namespace}/${pod}`
    );
    const text = await res.text();
    setLogs(text || "No logs available");
  };

  return (
    // 🔑 FIX: page now stretches full height
    <div className="flex flex-col min-h-screen p-4 sm:p-6 space-y-8">

      <h1 className="text-2xl sm:text-3xl font-bold">
        Structured Querying
      </h1>

      {/* ---------------- TABS ---------------- */}
      <div className="flex flex-wrap gap-6 border-b border-gray-700 pb-3">
        {[
          ["troubleshoot", "Troubleshooting"],
          ["logs", "Logs"],
          ["metrics", "Metrics"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-2 text-sm sm:text-base transition ${
              tab === key
                ? "border-b-2 border-blue-600 font-semibold text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ---------------- CONTENT ---------------- */}
      <div className="flex-1">

        {/* ---------------- TROUBLESHOOT ---------------- */}
        {tab === "troubleshoot" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <h2 className="font-semibold mb-2">Namespace</h2>
              <Select value={namespace} onChange={e => setNamespace(e.target.value)}>
                <option value="">Select Namespace</option>
                {namespaces.map(ns => (
                  <option key={ns}>{ns}</option>
                ))}
              </Select>
            </Card>

            <Card>
              <h2 className="font-semibold mb-2">Tool</h2>
              <Select value={tool} onChange={e => setTool(e.target.value)}>
                <option value="">Select Tool</option>
                {troubleshootTools.map(t => (
                  <option key={t.name}>{t.name}</option>
                ))}
              </Select>
            </Card>

            {tool && (
              <Card className="lg:col-span-3">
                <pre className="bg-black text-green-400 p-4 rounded h-48 text-xs sm:text-sm overflow-auto">
                  {terminal}
                </pre>
              </Card>
            )}
          </div>
        )}

        {/* ---------------- LOGS ---------------- */}
        {tab === "logs" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <Select value={namespace} onChange={e => setNamespace(e.target.value)}>
                  <option value="">Namespace</option>
                  {namespaces.map(ns => (
                    <option key={ns}>{ns}</option>
                  ))}
                </Select>
              </Card>

              <Card>
                <Select value={pod} onChange={e => setPod(e.target.value)}>
                  <option value="">Pod</option>
                  {pods.map(p => (
                    <option key={p}>{p}</option>
                  ))}
                </Select>
              </Card>

              <Button
                onClick={fetchLogs}
                disabled={!pod}
                className="flex items-center justify-center gap-2"
              >
                <Play size={16} /> Fetch Logs
              </Button>
            </div>

            <Card>
              {/* 🔑 FIX: logs area adapts to screen height */}
              <pre className="bg-[#0D1117] text-gray-200 p-4
                              min-h-[40vh] max-h-[60vh]
                              text-xs sm:text-sm
                              overflow-auto rounded">
                {logs}
              </pre>
            </Card>
          </div>
        )}

        {/* ---------------- METRICS ---------------- */}
        {tab === "metrics" && (
          <div className="space-y-6">
            {[
              ["CPU Usage", cpuData, "#22C55E"],
              ["Memory Usage", memoryData, "#3B82F6"],
              ["Requests", requestData, "#F59E0B"],
            ].map(([title, data, color]) => (
              <Card key={title}>
                <h2 className="font-semibold mb-2">{title}</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data}>
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      dataKey="value"
                      stroke={color}
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
    </div>
  );
}
