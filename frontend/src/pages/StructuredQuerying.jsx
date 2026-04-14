import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Wrench, FileText, Activity, ChevronDown,
  RefreshCw, AlertTriangle, Terminal,
  Search, Download,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";

const API = "http://localhost:5000/api";

/* ═══════════════════════════════════════
   COLOR PALETTE (New Theme)
═══════════════════════════════════════ */
const COLORS = {
  primary: "#A41F13",      // Fresh red
  secondary: "#FAF5F1",    // White fog
  accent: "#8F7A6E",       // Soft brown
  black: "#292F36",        // Carbon gray
  highlight: "#E0DBD8",    // Light gray
  white: "#FFFFFF",        // White
};

/* ── helpers ── */
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

function isAdmin() {
  try { return JSON.parse(localStorage.getItem("user"))?.role === "admin"; } catch { return false; }
}

/* ── simple select ── */
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>}
      {children}
    </div>
  );
}

function Select({ value, onChange, options, placeholder, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled || options.length === 0}
        className="w-full appearance-none px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 disabled:bg-gray-50 disabled:text-gray-400 pr-8"
      >
        <option value="">{placeholder}</option>
        {options.map(o => {
          const val = typeof o === "string" ? o : o.value ?? o;
          const lbl = typeof o === "string" ? o : o.label ?? o;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function Panel({ children }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════
   TROUBLESHOOT TAB
═══════════════════════════════════════ */

const TOOL_OPTIONS = [
  { value: "curl", label: "curl" },
  { value: "nc", label: "nc" },
  { value: "netshoot", label: "netshoot" },
];

const TOOL_CONFIGS = {
  curl: {
    helper: "HTTP requests only. Only commands starting with curl are allowed.",
    placeholder: "Type a curl command or select one below…",
    commands: [
      { label: "HEAD K8s API", cmd: "curl -I --insecure https://kubernetes.default.svc" },
      { label: "GET status code", cmd: "curl -s -o /dev/null -w '%{http_code}' --insecure https://kubernetes.default.svc" },
      { label: "Fetch /version", cmd: "curl -s --insecure https://kubernetes.default.svc/version" },
      { label: "Check DNS health", cmd: "curl -s --max-time 5 http://kube-dns.kube-system.svc.cluster.local:9153/metrics" },
    ],
  },
  nc: {
    helper: "TCP/UDP connectivity checks only. Only commands starting with nc are allowed.",
    placeholder: "Type an nc command or select one below…",
    commands: [
      { label: "Check K8s API 443", cmd: "nc -zv kubernetes.default.svc 443" },
      { label: "Check DNS 53", cmd: "nc -zvu kube-dns.kube-system.svc.cluster.local 53" },
      { label: "Check API with timeout", cmd: "nc -zv kubernetes.default.svc 443 -w 5" },
      { label: "Verbose TCP scan", cmd: "nc -vz kubernetes.default.svc 443" },
    ],
  },
  netshoot: {
    helper: "General netshoot diagnostics. Only bundled netshoot commands like ping, dig, nslookup, ip, ss and similar are allowed.",
    placeholder: "Type a netshoot diagnostic command or select one below…",
    commands: [
      { label: "Ping K8s API", cmd: "ping -c 4 kubernetes.default.svc" },
      { label: "Traceroute API", cmd: "traceroute kubernetes.default.svc" },
      { label: "Check DNS resolv", cmd: "cat /etc/resolv.conf" },
      { label: "nslookup K8s API", cmd: "nslookup kubernetes.default.svc" },
      { label: "dig K8s API", cmd: "dig kubernetes.default.svc" },
      { label: "DNS lookup host", cmd: "host kubernetes.default.svc" },
      { label: "Network interfaces", cmd: "ip a" },
      { label: "Routing table", cmd: "ip route" },
      { label: "Listening ports", cmd: "ss -tlnp" },
      { label: "ARP table", cmd: "arp -n" },
      { label: "Running processes", cmd: "ps aux" },
      { label: "Environment vars", cmd: "env" },
      { label: "Disk usage", cmd: "df -h" },
      { label: "Memory", cmd: "free -h" },
      { label: "OS info", cmd: "uname -a" },
    ],
  },
};

// Pod status badge colours
const POD_STATUS_STYLE = {
  Running:  "bg-green-100 text-green-700",
  Pending:  "bg-yellow-100 text-yellow-700",
  NotFound: "bg-gray-100 text-gray-500",
  Error:    "bg-red-100 text-red-700",
};

function TroubleshootTab({ namespace, namespaces, onNsChange, locked }) {
  const [command, setCommand] = useState("");
  const [output, setOutput]   = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError]     = useState("");
  const [podStatus, setPodStatus] = useState("NotFound");
  const [selectedTool, setSelectedTool] = useState("");
  const abortRef = useRef(null);

  useEffect(() => {
    setCommand("");
    setOutput("");
    setError("");
  }, [selectedTool]);

  // Poll debug pod status whenever namespace changes
  useEffect(() => {
    if (!namespace) { setPodStatus("NotFound"); return; }
    setPodStatus("Checking…");
    fetch(`${API}/troubleshoot/status/${encodeURIComponent(namespace)}`)
      .then(r => r.json())
      .then(d => setPodStatus(d.phase || "NotFound"))
      .catch(() => setPodStatus("Error"));
  }, [namespace]);

  async function run() {
    if (!namespace || !selectedTool || !command.trim()) return;
    setRunning(true); setOutput(""); setError("");

    const ac = new AbortController();
    abortRef.current = ac;
    const scopedNamespaces = getUserNamespaces();

    try {
      const res = await fetch(`${API}/troubleshoot/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namespace, tool: selectedTool, command, userNamespaces: scopedNamespaces }),
        signal: ac.signal,
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Command failed");
      else setOutput(data.output || "(no output)");
    } catch (e) {
      if (e.name === "AbortError") {
        setOutput("⚠ Command cancelled.");
      } else {
        setError("Failed to reach backend. Is the server running?");
      }
    } finally {
      abortRef.current = null;
      setRunning(false);
      // Refresh pod status
      fetch(`${API}/troubleshoot/status/${encodeURIComponent(namespace)}`)
        .then(r => r.json()).then(d => setPodStatus(d.phase || "NotFound")).catch(() => {});
    }
  }

  function stop() {
    if (abortRef.current) abortRef.current.abort();
  }

  const statusStyle = POD_STATUS_STYLE[podStatus] || "bg-gray-100 text-gray-500";
  const activeToolConfig = selectedTool ? TOOL_CONFIGS[selectedTool] : null;

  return (
    <div className="space-y-4">

      {/* ── Namespace + debug pod status ── */}
      <Panel>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[180px]">
            <Field label="Namespace">
              {locked ? (
        <div className="px-3 py-2 text-sm rounded-lg bg-surface border text-text font-mono">
          {namespace}
          <span className="ml-2 text-xs text-primary font-medium">(your team)</span>
        </div>
              ) : (
                <Select value={namespace} onChange={onNsChange} options={namespaces} placeholder="Select namespace" />
              )}
            </Field>
          </div>

          {namespace && (
            <div className="shrink-0 space-y-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Debug Pod</div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${statusStyle}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  podStatus === "Running" ? "bg-green-500"
                  : podStatus === "Pending" || podStatus === "Checking…" ? "bg-yellow-400 animate-pulse"
                  : "bg-gray-400"
                }`} />
                {podStatus === "NotFound" ? "Not created yet" : podStatus}
              </div>
            </div>
          )}
        </div>

        {namespace && (
          <p className="mt-3 text-xs text-gray-400">
            Commands run inside a <span className="font-mono">debug-shell</span> pod (nicolaka/netshoot) in the selected namespace.
            The pod is created automatically on first use.
          </p>
        )}
      </Panel>

      {namespace && (
        <>
          {/* ── Quick commands ── */}
          <Panel>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tool Commands</div>

            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 mb-4 items-start">
              <Field label="Tool">
                <Select
                  value={selectedTool}
                  onChange={setSelectedTool}
                  options={TOOL_OPTIONS}
                  placeholder="Select tool"
                />
              </Field>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Tool Policy</div>
                <p className="text-sm text-slate-600">
                  {activeToolConfig
                    ? activeToolConfig.helper
                    : "Select a tool first. The backend will reject commands that do not match the selected tool."}
                </p>
              </div>
            </div>

            {/* Command buttons */}
            <div className="flex flex-wrap gap-2">
              {(activeToolConfig?.commands || []).map(({ label, cmd }) => (
                <button
                  key={label}
                  onClick={() => setCommand(cmd)}
                  disabled={!selectedTool}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                    command === cmd
                      ? "bg-[#6366f1]/10 border-[#6366f1]/40 text-[#6366f1] font-medium"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600"
                  } disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-slate-200 disabled:hover:text-slate-500`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Panel>

          {/* ── Command editor ── */}
          <Panel>
            <Field label="Command to execute">
              <textarea
                value={command}
                onChange={e => setCommand(e.target.value)}
                rows={3}
                placeholder={activeToolConfig?.placeholder || "Select a tool first..."}
                disabled={!selectedTool}
                className="w-full font-mono text-sm px-3 py-2 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 resize-y disabled:opacity-60"
              />
            </Field>
            <div className="flex items-center gap-3 mt-3">
              {running ? (
                <button
                  onClick={stop}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <span className="w-2 h-2 bg-white rounded-sm inline-block" />
                  Stop
                </button>
              ) : (
                <button
                  onClick={run}
                  disabled={!selectedTool || !command.trim()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition"
                >
                  <Terminal size={14} />
                  Execute
                </button>
              )}
              {!running && !selectedTool && (
                <span className="text-xs text-amber-600">
                  Select a tool before entering a command.
                </span>
              )}
              {running && (
                <span className="text-xs text-gray-400 animate-pulse">
                  {podStatus === "Running" ? "Running command…" : "Starting debug pod…"}
                </span>
              )}
              {!running && command && (
                <button onClick={() => { setCommand(""); setOutput(""); setError(""); }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition">
                  Clear
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {error}
              </div>
            )}

            {output && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Output</div>
                <pre className="bg-[#0d1117] text-green-400 font-mono text-xs p-4 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                  {output}
                </pre>
              </div>
            )}
          </Panel>
        </>
      )}

      {!namespace && (
        <div className="text-center py-16 text-gray-400 text-sm">
          Select a namespace to start troubleshooting
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   LOGS TAB  (full LogViewer logic embedded)
═══════════════════════════════════════ */
function LogsTab({ namespace: parentNs, namespaces, onNsChange, locked }) {
  const logsRef = useRef(null);

  const [selectedNs, setSelectedNs]             = useState(parentNs || "");
  const [pods, setPods]                         = useState([]);
  const [selectedPod, setSelectedPod]           = useState("");
  const [containers, setContainers]             = useState([]);
  const [selectedContainer, setSelectedContainer] = useState("");
  const [previous, setPrevious]                 = useState(false);
  const [tail, setTail]                         = useState("200");
  const [logs, setLogs]                         = useState("");
  const [search, setSearch]                     = useState("");
  const [loading, setLoading]                   = useState(false);

  // Keep in sync if parent namespace changes (developer scope)
  useEffect(() => { if (parentNs) setSelectedNs(parentNs); }, [parentNs]);

  // Pods when namespace changes
  useEffect(() => {
    if (!selectedNs) { setPods([]); setSelectedPod(""); return; }
    fetch(`${API}/pods?namespace=${encodeURIComponent(selectedNs)}`)
      .then(r => r.json())
      .then(d => {
        const names = Array.isArray(d) ? d.map(p => p.metadata?.name).filter(Boolean) : [];
        setPods(names);
        setSelectedPod(""); setSelectedContainer(""); setContainers([]);
      })
      .catch(() => {});
  }, [selectedNs]);

  // Containers when pod changes
  useEffect(() => {
    if (!selectedNs || !selectedPod) { setContainers([]); setSelectedContainer(""); return; }
    fetch(`${API}/pods/${encodeURIComponent(selectedNs)}/${encodeURIComponent(selectedPod)}/containers`)
      .then(r => r.json())
      .then(d => {
        const all = [...(d.containers || []), ...(d.initContainers || [])];
        setContainers(all);
        setSelectedContainer(all[0] || "");
      })
      .catch(() => {});
  }, [selectedNs, selectedPod]);

  const fetchLogs = useCallback(async () => {
    if (!selectedNs || !selectedPod) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ tail });
      if (selectedContainer) params.set("container", selectedContainer);
      if (previous) params.set("previous", "true");
      const res = await fetch(`${API}/logs/${encodeURIComponent(selectedNs)}/${encodeURIComponent(selectedPod)}?${params}`);
      const text = await res.text();
      setLogs(text);
      setTimeout(() => logsRef.current?.scrollTo(0, logsRef.current.scrollHeight), 50);
    } catch {
      setLogs("Failed to fetch logs.");
    } finally {
      setLoading(false);
    }
  }, [selectedNs, selectedPod, selectedContainer, previous, tail]);

  // Auto-fetch when pod / container / options change
  useEffect(() => {
    if (selectedPod) fetchLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPod, selectedContainer, previous]);

  // Helpers identical to standalone LogViewer
  const filteredLines = logs
    ? logs.split("\n").filter(l => !search || l.toLowerCase().includes(search.toLowerCase()))
    : [];

  function downloadLogs() {
    const blob = new Blob([logs], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${selectedPod}-${selectedContainer || "logs"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function highlightLine(line) {
    if (!search) return line;
    const idx = line.toLowerCase().indexOf(search.toLowerCase());
    if (idx === -1) return line;
    return (
      <>
        {line.slice(0, idx)}
        <mark className="bg-yellow-200 text-black rounded px-0.5">
          {line.slice(idx, idx + search.length)}
        </mark>
        {line.slice(idx + search.length)}
      </>
    );
  }

  function lineColor(line) {
    const l = line.toLowerCase();
    if (l.includes("error") || l.includes("fatal") || l.includes("panic")) return "text-red-400";
    if (l.includes("warn"))  return "text-yellow-400";
    if (l.includes("info"))  return "text-green-400";
    return "text-gray-300";
  }

  /* ── namespace selector helper ── */
  function NsControl() {
    if (locked) {
      return (
        <div className="px-3 py-2 text-sm rounded-lg bg-surface border text-text font-mono">
          {selectedNs}
          <span className="ml-2 text-xs text-primary font-medium">(your team)</span>
        </div>
      );
    }
    return (
      <div className="relative">
        <select
          value={selectedNs}
          onChange={e => { setSelectedNs(e.target.value); onNsChange(e.target.value); }}
          className="w-full px-3 py-2 pr-8 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 appearance-none"
        >
          <option value="">Select namespace</option>
          {namespaces.map(ns => <option key={ns} value={ns}>{ns}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Controls */}
      <Panel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Namespace</label>
            <NsControl />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pod</label>
            <div className="relative">
              <select value={selectedPod}
                onChange={e => setSelectedPod(e.target.value)}
                disabled={!selectedNs}
                className="w-full px-3 py-2 pr-8 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 disabled:bg-gray-50 appearance-none">
                <option value="">Select pod</option>
                {pods.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Container</label>
            <div className="relative">
              <select value={selectedContainer}
                onChange={e => setSelectedContainer(e.target.value)}
                disabled={containers.length === 0}
                className="w-full px-3 py-2 pr-8 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 disabled:bg-gray-50 appearance-none">
                {containers.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lines</label>
            <div className="relative">
              <select value={tail} onChange={e => setTail(e.target.value)}
                className="w-full px-3 py-2 pr-8 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 appearance-none">
                {["50","100","200","500","1000"].map(n => (
                  <option key={n} value={n}>Last {n} lines</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Options row */}
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input type="checkbox" checked={previous}
              onChange={e => setPrevious(e.target.checked)}
              className="w-4 h-4 accent-[#6366f1]" />
            Show previous container logs
            <span className="text-xs text-gray-400">(useful for CrashLoopBackOff)</span>
          </label>

          <div className="flex-1 min-w-[200px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search in logs…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30" />
          </div>

          {logs && (
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {filteredLines.length} / {logs.split("\n").length} lines
            </span>
          )}

          <button onClick={fetchLogs} disabled={!selectedPod || loading}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 transition">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={downloadLogs} disabled={!logs}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 transition">
            <Download size={14} /> Download
          </button>
        </div>
      </Panel>

      {/* Log output */}
      {!selectedPod ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm border rounded-xl bg-gray-50">
          Select a namespace and pod to view logs
        </div>
      ) : loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm border rounded-xl bg-gray-50">
          Loading logs…
        </div>
      ) : (
        <div
          ref={logsRef}
          className="h-[calc(100vh-28rem)] min-h-64 overflow-y-auto bg-[#0d1117] rounded-xl p-4 font-mono text-xs leading-relaxed border border-gray-800"
        >
          {filteredLines.length === 0 ? (
            <span className="text-gray-500">No log lines match your search.</span>
          ) : (
            filteredLines.map((line, i) => (
              <div key={i} className={`${lineColor(line)} hover:bg-white/5 px-1 rounded`}>
                <span className="text-gray-600 select-none mr-3 text-right inline-block w-8">{i + 1}</span>
                {highlightLine(line)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   METRICS TAB
═══════════════════════════════════════ */

// Parse raw Prometheus text format into structured entries
function parsePrometheusText(raw) {
  const lines = raw.split("\n");
  const helpMap = {};
  const results = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("# HELP")) {
      const parts = t.split(" ");
      helpMap[parts[2]] = parts.slice(3).join(" ");
      continue;
    }
    if (t.startsWith("#")) continue;
    const spaceIdx = t.lastIndexOf(" ");
    if (spaceIdx === -1) continue;
    const labelPart = t.slice(0, spaceIdx);
    const value = t.slice(spaceIdx + 1);
    const braceOpen = labelPart.indexOf("{");
    const name   = braceOpen === -1 ? labelPart : labelPart.slice(0, braceOpen);
    const labels = braceOpen === -1 ? "" : labelPart.slice(braceOpen + 1, -1);
    if (name) results.push({ name, labels, value, help: helpMap[name] || "" });
  }
  return results;
}

/* ── Sub-tab 1: Pod Resource Usage (Metrics Server) ── */
function ResourceUsageTab({ namespace, namespaces, onNsChange, locked }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");
  const [sortCol, setSortCol] = useState("cpu");
  const [sortDir, setSortDir] = useState("desc");

  const load = useCallback(async () => {
    if (!namespace) return;
    setLoading(true); setError("");
    try {
      const r = await fetch(`${API}/container-metrics?namespace=${encodeURIComponent(namespace)}`);
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Failed to load metrics"); setRows([]); return; }
      const flat = [];
      for (const pod of d) {
        for (const c of pod.containers) {
          flat.push({ pod: pod.pod, namespace: pod.namespace, container: c.name, cpu: c.cpu, memory: c.memory });
        }
      }
      setRows(flat);
    } catch { setError("Failed to reach backend"); }
    finally { setLoading(false); }
  }, [namespace]);

  useEffect(() => { load(); }, [load]);

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  }

  const filtered = rows
    .filter(r => !search || r.pod.includes(search) || r.container.includes(search))
    .sort((a, b) => {
      const v = sortDir === "asc" ? 1 : -1;
      return typeof a[sortCol] === "number"
        ? (a[sortCol] - b[sortCol]) * v
        : String(a[sortCol]).localeCompare(String(b[sortCol])) * v;
    });

  const maxCpu = Math.max(...rows.map(r => r.cpu), 1);
  const maxMem = Math.max(...rows.map(r => r.memory), 1);

  function SortIcon({ col }) {
    if (sortCol !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-[#6366f1] ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[180px]">
            <Field label="Namespace">
              {locked ? (
                <div className="px-3 py-2 text-sm rounded-lg bg-gray-50 border text-gray-700 font-mono">
                  {namespace}<span className="ml-2 text-xs text-[#6366f1] font-medium">(your team)</span>
                </div>
              ) : (
                <Select value={namespace} onChange={onNsChange} options={namespaces} placeholder="Select namespace" />
              )}
            </Field>
          </div>
          <div className="flex-1 min-w-[200px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter pod / container…"
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30" />
          </div>
          <button onClick={load} disabled={loading || !namespace}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 transition">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
        {error && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertTriangle size={14} className="shrink-0" /> {error}
          </div>
        )}
      </Panel>

      {!namespace ? (
        <div className="text-center py-16 text-gray-400 text-sm">Select a namespace to view resource usage</div>
      ) : loading ? (
        <div className="text-center py-16 text-gray-400 text-sm animate-pulse">Loading metrics…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No data — is the Metrics Server installed and running?</div>
      ) : (
        <Panel>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
                <th className="pb-2 text-left cursor-pointer select-none" onClick={() => toggleSort("pod")}>Pod <SortIcon col="pod" /></th>
                <th className="pb-2 text-left cursor-pointer select-none" onClick={() => toggleSort("container")}>Container <SortIcon col="container" /></th>
                <th className="pb-2 text-right cursor-pointer select-none" onClick={() => toggleSort("cpu")}>CPU (m) <SortIcon col="cpu" /></th>
                <th className="pb-2 pr-2 w-28 hidden sm:table-cell"></th>
                <th className="pb-2 text-right cursor-pointer select-none" onClick={() => toggleSort("memory")}>Mem (Mi) <SortIcon col="memory" /></th>
                <th className="pb-2 w-28 hidden sm:table-cell"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="py-2 font-mono text-xs text-gray-700 max-w-[150px] truncate pr-2" title={r.pod}>{r.pod}</td>
                  <td className="py-2 text-xs text-gray-500 pr-4">{r.container}</td>
                  <td className="py-2 text-right font-mono text-xs font-semibold text-blue-700">{r.cpu}</td>
                  <td className="py-2 px-2 hidden sm:table-cell">
                    <div className="h-1.5 rounded-full bg-gray-100 w-28">
                      <div className="h-full rounded-full bg-blue-400" style={{ width: `${Math.min((r.cpu / maxCpu) * 100, 100)}%` }} />
                    </div>
                  </td>
                  <td className="py-2 text-right font-mono text-xs font-semibold text-green-700">{r.memory}</td>
                  <td className="py-2 px-2 hidden sm:table-cell">
                    <div className="h-1.5 rounded-full bg-gray-100 w-28">
                      <div className="h-full rounded-full bg-green-400" style={{ width: `${Math.min((r.memory / maxMem) * 100, 100)}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-gray-400 text-right">{filtered.length} container{filtered.length !== 1 ? "s" : ""}</p>
        </Panel>
      )}
    </div>
  );
}

/* ── Sub-tab 2: Scrape /metrics endpoint from inside cluster ── */
function EndpointScrapeTab({ namespace, namespaces, onNsChange, locked }) {
  const [services, setServices]       = useState([]);
  const [service, setService]         = useState("");
  const [ports, setPorts]             = useState([]);
  const [port, setPort]               = useState("");
  const [scraping, setScraping]       = useState(false);
  const [parsed, setParsed]           = useState(null);
  const [scrapeError, setScrapeError] = useState("");
  const [metricSearch, setMetricSearch] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState(new Set());
  const [timeRange, setTimeRange] = useState("5m");
  const [refreshInterval, setRefreshInterval] = useState("30s");

  useEffect(() => {
    if (!namespace) { setServices([]); setService(""); return; }
    fetch(`${API}/services/${encodeURIComponent(namespace)}`)
      .then(r => r.json()).then(d => Array.isArray(d) ? setServices(d) : setServices([]))
      .catch(() => setServices([]));
  }, [namespace]);

  useEffect(() => {
    if (!namespace || !service) { setPorts([]); setPort(""); return; }
    fetch(`${API}/service-ports/${encodeURIComponent(namespace)}/${encodeURIComponent(service)}`)
      .then(r => r.json()).then(d => Array.isArray(d) ? setPorts(d) : setPorts([]))
      .catch(() => setPorts([]));
  }, [namespace, service]);

  async function scrape() {
    if (!namespace || !service || !port) return;
    setScraping(true); setParsed(null); setScrapeError("");
    try {
      const r = await fetch(
        `${API}/scrape-metrics?namespace=${encodeURIComponent(namespace)}&service=${encodeURIComponent(service)}&port=${encodeURIComponent(port)}`
      );
      const d = await r.json();
      if (d.noMetrics) setScrapeError(d.message);
      else {
        const parsedMetrics = parsePrometheusText(d.raw);
        setParsed(parsedMetrics);
        // Don't auto-select metrics - let user choose what to visualize
        setSelectedMetrics(new Set());
      }
    } catch { setScrapeError("Failed to reach backend"); }
    finally { setScraping(false); }
  }

  // Categorize metrics by type based on name patterns
  function categorizeMetrics(metrics) {
    const categorized = {
      gauges: [],
      counters: [],
      histograms: [],
      summaries: [],
      others: []
    };

    metrics.forEach(m => {
      const name = m.name.toLowerCase();
      if (name.includes('_total')) {
        categorized.counters.push(m);
      } else if (name.includes('_bucket') || name.includes('_count') || name.includes('_sum')) {
        categorized.histograms.push(m);
      } else if (name.includes('_histogram') || name.includes('_summary')) {
        categorized.summaries.push(m);
      } else if (name.includes('_gauge')) {
        categorized.gauges.push(m);
      } else if (name.includes('version') || name.includes('build_info')) {
        // Version and build info metrics are not gauges
        categorized.others.push(m);
      } else if (!name.includes('_')) {
        // Metrics without underscores are likely gauges
        categorized.gauges.push(m);
      } else {
        categorized.others.push(m);
      }
    });

    return categorized;
  }

  // Group histogram metrics by their base name
  function groupHistogramMetrics(metrics) {
    const groups = {};
    metrics.forEach(m => {
      const name = m.name.toLowerCase();
      // Remove suffixes to get base name
      const baseName = name.replace(/(_bucket|_count|_sum)$/, '');
      if (!groups[baseName]) groups[baseName] = [];
      groups[baseName].push(m);
    });
    return groups;
  }

  const categorizedMetrics = parsed ? categorizeMetrics(parsed) : null;
  const histogramGroups = parsed ? groupHistogramMetrics(parsed) : {};
  
  // Create a combined list that shows grouped histograms and individual non-histogram metrics
  const displayed = [];
  
  // Helper function to check if a metric should be filtered out (version, build info, etc.)
  function shouldFilterMetric(metric) {
    const name = metric.name.toLowerCase();
    // Filter out version, build_info, go_ and process_ metrics as they're not useful for monitoring
    return name.includes('version') || name.includes('build_info') || name.includes('go_') || name.includes('process_');
  }
  
  if (parsed) {
    // Add grouped histograms (one entry per histogram) - but only if they're not filtered
    Object.keys(histogramGroups).forEach(baseName => {
      const metrics = histogramGroups[baseName];
      // Check if this histogram group should be filtered
      if (shouldFilterMetric(metrics[0])) return;
      
      // Use the first metric as representative, but store all buckets
      const representative = metrics[0];
      displayed.push({
        ...representative,
        _isHistogramGroup: true,
        _histogramBuckets: metrics
      });
    });
    
    // Add non-histogram metrics (gauges, counters, etc.)
    const nonHistogramMetrics = parsed.filter(m => {
      const name = m.name.toLowerCase();
      return !(name.includes('_bucket') || name.includes('_count') || name.includes('_sum'));
    });
    
    nonHistogramMetrics.forEach(m => {
      // Skip filtered metrics
      if (shouldFilterMetric(m)) return;
      
      // Only add if not already included as part of a histogram group
      const baseName = m.name.toLowerCase().replace(/(_bucket|_count|_sum)$/, '');
      if (!histogramGroups[baseName]) {
        displayed.push(m);
      }
    });
  }
  
  // Apply search filter
  const filteredDisplayed = displayed.filter(m =>
    !metricSearch || m.name.includes(metricSearch) || m.labels.includes(metricSearch)
  );

  // Visualization component
  function MetricVisualization() {
    if (!parsed || selectedMetrics.size === 0) return null;

    // Handle histogram groups and individual metrics
    const selected = [];
    
    selectedMetrics.forEach(key => {
      // Check if this is a histogram group key
      if (key.includes('_histogram_group_')) {
        const baseName = key.replace('_histogram_group_', '');
        const histogramGroup = histogramGroups[baseName];
        if (histogramGroup) {
          selected.push({
            ...histogramGroup[0],
            _isHistogramGroup: true,
            _histogramBuckets: histogramGroup
          });
        }
      } else {
        // Individual metric
        const metric = parsed.find(m => `${m.name}{${m.labels || ''}}` === key);
        if (metric) selected.push(metric);
      }
    });
    
    return (
      <div className="space-y-6">
        {selected.map((metric, index) => (
          <MetricChart key={index} metric={metric} />
        ))}
      </div>
    );
  }

  // Auto-refresh functionality
  useEffect(() => {
    if (refreshInterval === "off") return;
    
    const interval = setInterval(() => {
      if (namespace && service && port && parsed) {
        // Re-scrape metrics with the selected time range
        scrape();
      }
    }, parseRefreshInterval(refreshInterval));

    return () => clearInterval(interval);
  }, [refreshInterval, namespace, service, port, parsed]);

  function parseRefreshInterval(interval) {
    if (interval === "10s") return 10000;
    if (interval === "30s") return 30000;
    if (interval === "1m") return 60000;
    return 30000; // default to 30s
  }

  return (
    <div className="space-y-4">
      <Panel>
        <p className="text-xs text-gray-400 mb-4">
          Scrapes a service's <span className="font-mono bg-gray-100 px-1 rounded">/metrics</span> endpoint
          from inside the cluster using the debug-shell pod. Works with any service exposing Prometheus-format metrics.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Namespace">
            {locked ? (
              <div className="px-3 py-2 text-sm rounded-lg bg-gray-50 border text-gray-700 font-mono">
                {namespace}<span className="ml-2 text-xs text-[#6366f1] font-medium">(your team)</span>
              </div>
            ) : (
              <Select value={namespace} onChange={v => { onNsChange(v); setService(""); setPort(""); setParsed(null); setSelectedMetrics(new Set()); }}
                options={namespaces} placeholder="Select namespace" />
            )}
          </Field>
          <Field label="Service">
            <Select value={service} onChange={v => { setService(v); setPort(""); setParsed(null); setSelectedMetrics(new Set()); }}
              options={services} placeholder={namespace ? "Select service" : "Select namespace first"} disabled={!namespace} />
          </Field>
          <Field label="Port">
            <Select value={port} onChange={setPort}
              options={ports} placeholder={service ? "Select port" : "Select service first"} disabled={!service} />
          </Field>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={scrape} disabled={scraping || !service || !port}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#6366f1] text-white rounded-lg hover:bg-[#4f46e5] disabled:opacity-50 transition">
            <Activity size={14} /> {scraping ? "Scraping…" : "Scrape /metrics"}
          </button>
          {scraping && <span className="text-xs text-gray-400 animate-pulse">Connecting via debug pod…</span>}
        </div>
        {scrapeError && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
            <AlertTriangle size={14} className="shrink-0" /> {scrapeError}
          </div>
        )}
      </Panel>

      {parsed && (
        <>
          {/* Metric Selection Panel */}
          <Panel>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Available Metrics ({parsed.length}) - Select to visualize
              </span>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>Gauges: {categorizedMetrics.gauges.length}</span>
                <span>Counters: {categorizedMetrics.counters.length}</span>
                <span>Histograms: {categorizedMetrics.histograms.length}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {displayed.map((m, i) => {
                const key = `${m.name}{${m.labels || ''}}`;
                const isSelected = selectedMetrics.has(key);
                const type = getMetricType(m);
                
                return (
                  <label key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const newSet = new Set(selectedMetrics);
                        if (e.target.checked) newSet.add(key);
                        else newSet.delete(key);
                        setSelectedMetrics(newSet);
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-semibold text-gray-900 truncate">{m.name}</div>
                      {m.labels && <div className="font-mono text-xs text-gray-500 truncate">{`{${m.labels}}`}</div>}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          type === 'gauge' ? 'bg-green-100 text-green-800' :
                          type === 'counter' ? 'bg-blue-100 text-blue-800' :
                          type === 'histogram' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {type.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">{m.value}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </Panel>

          {/* Visualization Panel */}
          {selectedMetrics.size > 0 && (
            <Panel>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Metric Visualization</h3>
                <div className="flex gap-4 text-sm">
                  <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}
                    className="px-3 py-1 border rounded text-sm">
                    <option value="1m">Last 1 minute</option>
                    <option value="5m">Last 5 minutes</option>
                    <option value="15m">Last 15 minutes</option>
                    <option value="1h">Last 1 hour</option>
                  </select>
                  <select value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)}
                    className="px-3 py-1 border rounded text-sm">
                    <option value="10s">Auto-refresh: 10s</option>
                    <option value="30s">Auto-refresh: 30s</option>
                    <option value="1m">Auto-refresh: 1m</option>
                    <option value="off">Auto-refresh: Off</option>
                  </select>
                </div>
              </div>
              <MetricVisualization />
            </Panel>
          )}
        </>
      )}
    </div>
  );
}

// Helper function to determine metric type
function getMetricType(metric) {
  const name = metric.name.toLowerCase();
  if (name.includes('_total')) return 'counter';
  if (name.includes('_bucket') || name.includes('_count') || name.includes('_sum')) return 'histogram';
  if (name.includes('_gauge') || !name.includes('_')) return 'gauge';
  return 'other';
}

  // Check if metric should be visualized (skip version info, build info, etc.)
function shouldVisualizeMetric(metric) {
  const name = metric.name.toLowerCase();
  // Skip build_info and go_ metrics as they're not useful for visualization
  if (name.includes('build_info') || name.includes('go_') || name.includes('process_')) {
    return false;
  }
  // Allow all other metrics including version metrics
  return true;
}

// Individual metric chart component
function MetricChart({ metric }) {
  const type = getMetricType(metric);
  const value = parseFloat(metric.value) || 0;
  
  // Don't visualize version/build info metrics
  if (!shouldVisualizeMetric(metric)) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-mono font-semibold text-gray-900">{metric.name}</h4>
            {metric.labels && <span className="font-mono text-sm text-gray-500">{`{${metric.labels}}`}</span>}
          </div>
          <div className="flex gap-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              SKIPPED
            </span>
            <span className="font-mono text-sm text-gray-600">Value: {value}</span>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded">
          This metric type is not suitable for visualization
        </div>
        {metric.help && (
          <p className="mt-2 text-xs text-gray-400 italic">#{metric.help}</p>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-mono font-semibold text-gray-900">{metric.name}</h4>
          {metric.labels && <span className="font-mono text-sm text-gray-500">{`{${metric.labels}}`}</span>}
        </div>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            type === 'gauge' ? 'bg-green-100 text-green-800' :
            type === 'counter' ? 'bg-blue-100 text-blue-800' :
            type === 'histogram' ? 'bg-purple-100 text-purple-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {type.toUpperCase()}
          </span>
          <span className="font-mono text-sm text-gray-600">Current: {value}</span>
        </div>
      </div>
      
      <div className="h-64">
        {type === 'gauge' ? (
          <GaugeChart value={value} name={metric.name} />
        ) : type === 'counter' ? (
          <CounterChart value={value} name={metric.name} />
        ) : type === 'histogram' ? (
          <HistogramChart value={value} name={metric.name} />
        ) : (
          <SimpleLineChart value={value} name={metric.name} />
        )}
      </div>
      
      {metric.help && (
        <p className="mt-2 text-xs text-gray-400 italic">#{metric.help}</p>
      )}
    </div>
  );
}

// Chart components using Recharts with new color palette
function GaugeChart({ value, name }) {
  const data = [{ name: name, value: value, fill: COLORS.primary }];
  const max = Math.max(value * 1.5, 100);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          startAngle={180}
          endAngle={0}
          innerRadius={60}
          outerRadius={80}
          dataKey="value"
        />
        <text x="50%" y="60%" textAnchor="middle" className="text-lg font-bold" fill={COLORS.black}>
          {value}
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}

function CounterChart({ value, name }) {
  const data = [
    { time: "Now", value: value },
    { time: "1m ago", value: value * 0.8 },
    { time: "2m ago", value: value * 0.9 },
    { time: "3m ago", value: value * 0.7 },
    { time: "4m ago", value: value * 0.85 },
    { time: "5m ago", value: value * 0.6 },
  ];
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.accent} />
        <XAxis dataKey="time" tick={{ fontSize: 12, fill: COLORS.black }} />
        <YAxis tick={{ fontSize: 12, fill: COLORS.black }} />
        <Tooltip 
          contentStyle={{ backgroundColor: COLORS.white, border: `1px solid ${COLORS.accent}` }}
        />
        <Line type="monotone" dataKey="value" stroke={COLORS.primary} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function HistogramChart({ value, name, buckets }) {
  // If we have actual bucket data, use it; otherwise create sample distribution
  let data;
  if (buckets && buckets.length > 0) {
    // Parse bucket labels to extract the upper bound (le value)
    data = buckets.map(metric => {
      const leMatch = metric.labels.match(/le="([^"]+)"/);
      const leValue = leMatch ? leMatch[1] : 'unknown';
      const bucketValue = parseFloat(metric.value) || 0;
      
      // For histogram buckets, we want to show the cumulative count up to each bucket
      return {
        bucket: `≤ ${leValue}`,
        value: bucketValue,
        rawLe: leValue === '+Inf' ? Infinity : parseFloat(leValue)
      };
    }).sort((a, b) => {
      // Sort by le value, handling +Inf
      if (a.rawLe === Infinity) return 1;
      if (b.rawLe === Infinity) return -1;
      return a.rawLe - b.rawLe;
    });
  } else {
    // Fallback to sample distribution if no bucket data
    data = [
      { bucket: "≤ 0.1", value: value * 0.3, rawLe: 0.1 },
      { bucket: "≤ 0.5", value: value * 0.7, rawLe: 0.5 },
      { bucket: "≤ 1.0", value: value * 0.9, rawLe: 1.0 },
      { bucket: "≤ 5.0", value: value * 0.95, rawLe: 5.0 },
      { bucket: "≤ +Inf", value: value, rawLe: Infinity },
    ];
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.accent} />
        <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: COLORS.black }} angle={-45} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 12, fill: COLORS.black }} />
        <Tooltip 
          contentStyle={{ backgroundColor: COLORS.white, border: `1px solid ${COLORS.accent}` }}
          formatter={(value) => [value.toLocaleString(), 'Count']}
          labelFormatter={(label) => `Bucket: ${label}`}
        />
        <Bar dataKey="value" fill={COLORS.highlight} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function SimpleLineChart({ value, name }) {
  const data = [
    { time: "1", value: value * 0.9 },
    { time: "2", value: value * 1.1 },
    { time: "3", value: value * 0.8 },
    { time: "4", value: value * 1.2 },
    { time: "5", value: value * 0.95 },
  ];
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.accent} />
        <XAxis dataKey="time" tick={{ fontSize: 12, fill: COLORS.black }} />
        <YAxis tick={{ fontSize: 12, fill: COLORS.black }} />
        <Tooltip 
          contentStyle={{ backgroundColor: COLORS.white, border: `1px solid ${COLORS.accent}` }}
        />
        <Line type="monotone" dataKey="value" stroke={COLORS.accent} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ── MetricsTab wrapper with mode toggle ── */
function MetricsTab({ namespace, namespaces, onNsChange, locked }) {
  const [mode, setMode] = useState("resource");

  return (
    <div className="space-y-4">
      <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5 w-fit">
        {[
          { id: "resource", label: "Pod Resource Usage" },
          { id: "scrape",   label: "Endpoint Scraping"  },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setMode(id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              mode === id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {mode === "resource"
        ? <ResourceUsageTab namespace={namespace} namespaces={namespaces} onNsChange={onNsChange} locked={locked} />
        : <EndpointScrapeTab namespace={namespace} namespaces={namespaces} onNsChange={onNsChange} locked={locked} />
      }
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */
const TABS = [
  { key: "troubleshoot", label: "Troubleshooting", Icon: Wrench },
  { key: "logs",         label: "Logs",             Icon: FileText },
  { key: "metrics",      label: "Metrics",           Icon: Activity },
];

export default function StructuredQuerying() {
  const [tab, setTab] = useState("troubleshoot");

  // Namespace state — shared across tabs
  const userNsList = getUserNamespaces(); // empty = admin
  const isDevWithNs = userNsList.length > 0;
  const [namespace, setNamespace] = useState(userNsList[0] || "");
  const [namespaces, setNamespaces] = useState([]);

  // Fetch available namespaces; for developers restrict to their team's list
  useEffect(() => {
    if (isDevWithNs) {
      setNamespaces(userNsList);
      return;
    }
    fetch(`${API}/namespaces`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const list = data.map(n => (typeof n === "string" ? n : n.metadata?.name)).filter(Boolean);
        setNamespaces(list.sort());
      })
      .catch(() => setNamespaces([]));
  }, [isDevWithNs]);

  return (
    <div className="space-y-5 pt-4 md:pt-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Structured Querying</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Debug, inspect logs and fetch metrics from your cluster
            {isDevWithNs && (
              <span className="ml-2 text-indigo-600 font-medium">
                · Scoped to: {userNsList.join(", ")}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ── Segmented tab bar ── */}
      <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5 w-fit">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === key
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {tab === "troubleshoot" && (
        <TroubleshootTab
          namespace={namespace} namespaces={namespaces}
          onNsChange={setNamespace} locked={isDevWithNs && userNsList.length === 1}
        />
      )}
      {tab === "logs" && (
        <LogsTab
          namespace={namespace} namespaces={namespaces}
          onNsChange={setNamespace} locked={isDevWithNs && userNsList.length === 1}
        />
      )}
      {tab === "metrics" && (
        <MetricsTab
          namespace={namespace} namespaces={namespaces}
          onNsChange={setNamespace} locked={isDevWithNs && userNsList.length === 1}
        />
      )}
    </div>
  );
}
