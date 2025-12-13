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

/* ---------------- MOCK DATA ---------------- */

const namespaces = ["dev", "staging", "prod"];

const podsByNs = {
  dev: ["dev-pod-1", "dev-api-2"],
  staging: ["stg-worker-1", "stg-api-22"],
  prod: ["prod-billing-01", "prod-search-02"],
};

const servicesByNs = {
  dev: ["auth-svc", "order-svc"],
  staging: ["payment-svc"],
  prod: ["search-svc", "billing-svc"],
};

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

/* Prometheus-style Metrics */
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

/* ---------------- COMPONENT ---------------- */

export default function StructuredQuerying() {
  const [tab, setTab] = useState("troubleshoot");

  const [namespace, setNamespace] = useState("");
  const [pod, setPod] = useState("");
  const [service, setService] = useState("");
  const [tool, setTool] = useState("");
  const [terminal, setTerminal] = useState("");
  const [logs, setLogs] = useState("Logs will appear here...\n");

  useEffect(() => {
    setPod("");
    setService("");
    setTool("");
    setTerminal("");
  }, [namespace]);

  /* TOOL → TERMINAL UPDATE */
  useEffect(() => {
    const selected = troubleshootTools.find(t => t.name === tool);
    if (selected && namespace) {
      setTerminal(
`$ kubectl run debug --image=${tool.toLowerCase()} -n ${namespace}
${selected.cmd}`
      );
    }
  }, [tool, namespace]);

  const fetchLogs = () => {
    setLogs(
`10:01 INFO Starting container
10:02 INFO Connecting DB
10:03 ERROR Timeout
10:04 WARN Retrying`
    );
  };

  return (
    <div className="p-6 space-y-8">

      <h1 className="text-3xl font-bold">Structured Querying</h1>

      {/* ---------------- TABS ---------------- */}
      <div className="flex gap-12 border-b pb-3">
        {[
          ["troubleshoot", "1️⃣ Troubleshooting"],
          ["logs", "2️⃣ Logs"],
          ["metrics", "3️⃣ Metrics"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={tab === key
              ? "border-b-2 border-blue-600 font-semibold pb-2"
              : "text-gray-500 pb-2"}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ---------------- TROUBLESHOOT ---------------- */}
      {tab === "troubleshoot" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <Card>
            <h2 className="font-semibold mb-3">Namespace</h2>
            <Select value={namespace} onChange={e => setNamespace(e.target.value)}>
              <option value="">Select Namespace</option>
              {namespaces.map(ns => <option key={ns}>{ns}</option>)}
            </Select>
          </Card>

          {namespace && (
            <Card>
              <h2 className="font-semibold mb-3">Tool</h2>
              <Select value={tool} onChange={e => setTool(e.target.value)}>
                <option value="">Select Tool</option>
                {troubleshootTools.map(t => (
                  <option key={t.name}>{t.name}</option>
                ))}
              </Select>
            </Card>
          )}

          {tool && (
            <Card className="lg:col-span-3">
              <h2 className="font-semibold mb-2">Terminal</h2>
              <pre className="bg-black text-green-400 p-4 rounded h-52 font-mono text-sm">
                {terminal}
              </pre>
            </Card>
          )}
        </div>
      )}

      {/* ---------------- LOGS ---------------- */}
      {tab === "logs" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <Card>
            <h2 className="font-semibold mb-2">Namespace</h2>
            <Select value={namespace} onChange={e => setNamespace(e.target.value)}>
              <option value="">Select Namespace</option>
              {namespaces.map(ns => <option key={ns}>{ns}</option>)}
            </Select>
          </Card>

          <Card>
            <h2 className="font-semibold mb-2">Pod</h2>
            <Select
              disabled={!namespace}
              value={pod}
              onChange={e => setPod(e.target.value)}
            >
              <option value="">Select Pod</option>
              {(podsByNs[namespace] || []).map(p => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </Card>

          <Button
            disabled={!pod}
            onClick={fetchLogs}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600
                       hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={16} /> Fetch Logs
          </Button>

          <Card className="lg:col-span-3">
            <pre className="bg-[#0D1117] text-gray-200 p-4 h-80 overflow-auto rounded font-mono text-sm">
              {logs}
            </pre>
          </Card>
        </div>
      )}

      {/* ---------------- METRICS ---------------- */}
      {tab === "metrics" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <Card>
            <h2 className="font-semibold mb-2">Namespace</h2>
            <Select value={namespace} onChange={e => setNamespace(e.target.value)}>
              <option value="">Select Namespace</option>
              {namespaces.map(ns => <option key={ns}>{ns}</option>)}
            </Select>
          </Card>

          <Card>
            <h2 className="font-semibold mb-2">Service</h2>
            <Select
              disabled={!namespace}
              value={service}
              onChange={e => setService(e.target.value)}
            >
              <option value="">Select Service</option>
              {(servicesByNs[namespace] || []).map(s => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Card>

          <Card>
            <h2 className="font-semibold mb-2">Metrics</h2>
            <ul className="text-sm font-mono space-y-1">
              <li>container_cpu_usage_seconds_total</li>
              <li>container_memory_working_set_bytes</li>
              <li>http_requests_total</li>
            </ul>
          </Card>

          {service && (
            <>
              {[["CPU Usage", cpuData, "#22C55E"],
                ["Memory Usage", memoryData, "#3B82F6"],
                ["Requests", requestData, "#F59E0B"]]
                .map(([title, data, color]) => (
                  <Card key={title} className="lg:col-span-3">
                    <h2 className="font-semibold mb-2">{title}</h2>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={data}>
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line dataKey="value" stroke={color} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
