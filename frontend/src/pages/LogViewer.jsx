import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, RefreshCw, Download, ChevronDown } from "lucide-react";

const API = "/api";

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

export default function LogViewer() {
  const userNsList = getUserNamespaces();
  const [searchParams] = useSearchParams();

  const [namespaces, setNamespaces] = useState([]);
  const [pods, setPods] = useState([]);
  const [containers, setContainers] = useState([]);

  const [selectedNs, setSelectedNs] = useState(userNsList[0] || searchParams.get("ns") || "");
  const [selectedPod, setSelectedPod] = useState(searchParams.get("pod") || "");
  const [selectedContainer, setSelectedContainer] = useState("");
  const [previous, setPrevious] = useState(false);
  const [tail, setTail] = useState("200");

  const [logs, setLogs] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const logsRef = useRef(null);

  // Load namespaces — restrict to team's list for developers
  useEffect(() => {
    if (userNsList.length) {
      setNamespaces(userNsList);
      return;
    }
    fetch(`${API}/namespaces`)
      .then(r => r.json())
      .then(d => setNamespaces(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [userNsList.join(",")]);

  // Load pods when namespace changes
  useEffect(() => {
    if (!selectedNs) { setPods([]); setSelectedPod(""); return; }
    fetch(`${API}/pods?namespace=${encodeURIComponent(selectedNs)}`)
      .then(r => r.json())
      .then(d => {
        const names = Array.isArray(d) ? d.map(p => p.metadata?.name).filter(Boolean) : [];
        setPods(names);
        setSelectedPod("");
        setSelectedContainer("");
        setContainers([]);
      })
      .catch(() => {});
  }, [selectedNs]);

  // Load containers when pod changes
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

  useEffect(() => {
    if (selectedPod) fetchLogs();
  }, [selectedPod, selectedContainer, previous, fetchLogs]);

  const filteredLines = logs
    ? logs.split("\n").filter(l => !search || l.toLowerCase().includes(search.toLowerCase()))
    : [];

  function downloadLogs() {
    const blob = new Blob([logs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
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
        <mark className="bg-yellow-200 text-black rounded px-0.5">{line.slice(idx, idx + search.length)}</mark>
        {line.slice(idx + search.length)}
      </>
    );
  }

  function lineColor(line) {
    const l = line.toLowerCase();
    if (l.includes("error") || l.includes("fatal") || l.includes("panic")) return "text-red-400";
    if (l.includes("warn")) return "text-yellow-400";
    if (l.includes("info")) return "text-green-400";
    return "text-gray-300";
  }

  return (
    <div className="space-y-5 h-full flex flex-col pt-4 md:pt-6">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Log Viewer</h1>
          <p className="text-sm text-gray-500">Select a pod to stream its logs</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchLogs}
            disabled={!selectedPod || loading}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={downloadLogs}
            disabled={!logs}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Namespace */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Namespace</label>
          <div className="relative">
            <select
              value={selectedNs}
              onChange={e => setSelectedNs(e.target.value)}
              disabled={userNsList.length === 1}
              className="w-full px-3 py-2 pr-8 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:bg-slate-50 appearance-none"
            >
              <option value="">Select namespace</option>
              {namespaces.map(ns => <option key={ns} value={ns}>{ns}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Pod */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pod</label>
          <div className="relative">
            <select
              value={selectedPod}
              onChange={e => setSelectedPod(e.target.value)}
              disabled={!selectedNs}
              className="w-full px-3 py-2 pr-8 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:bg-slate-50 appearance-none"
            >
              <option value="">Select pod</option>
              {pods.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Container */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Container</label>
          <div className="relative">
            <select
              value={selectedContainer}
              onChange={e => setSelectedContainer(e.target.value)}
              disabled={containers.length === 0}
              className="w-full px-3 py-2 pr-8 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:bg-slate-50 appearance-none"
            >
              {containers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Tail lines */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Lines</label>
          <div className="relative">
            <select
              value={tail}
              onChange={e => setTail(e.target.value)}
              className="w-full px-3 py-2 pr-8 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 appearance-none"
            >
              {["50", "100", "200", "500", "1000"].map(n => (
                <option key={n} value={n}>Last {n} lines</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* OPTIONS ROW */}
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={previous}
            onChange={e => setPrevious(e.target.checked)}
            className="w-4 h-4 accent-[#6366f1]"
          />
          Show previous container logs
          <span className="text-xs text-gray-400">(useful for CrashLoopBackOff)</span>
        </label>

        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search in logs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        {logs && (
          <span className="text-xs text-gray-400">
            {filteredLines.length} / {logs.split("\n").length} lines
          </span>
        )}
      </div>

      {/* LOG OUTPUT */}
      <div className="flex-1 min-h-0">
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
            className="h-[calc(100vh-26rem)] min-h-64 overflow-y-auto bg-[#0d1117] rounded-xl p-4 font-mono text-xs leading-relaxed border border-gray-800"
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
    </div>
  );
}
