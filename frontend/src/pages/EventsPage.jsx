import React, { useEffect, useState, useCallback } from "react";
import { AlertTriangle, RefreshCw, Info, ChevronLeft, ChevronRight } from "lucide-react";

const API = "http://localhost:5000/api";
const PAGE_SIZE_OPTIONS = [25, 50, 100];

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

const REASON_COLORS = {
  OOMKilling: "bg-red-100 text-red-700",
  BackOff: "bg-red-100 text-red-700",
  CrashLoopBackOff: "bg-red-100 text-red-700",
  Failed: "bg-red-100 text-red-700",
  FailedMount: "bg-orange-100 text-orange-700",
  FailedScheduling: "bg-orange-100 text-orange-700",
  Pulling: "bg-blue-100 text-blue-700",
  Pulled: "bg-green-100 text-green-700",
  Created: "bg-green-100 text-green-700",
  Started: "bg-green-100 text-green-700",
  Scheduled: "bg-green-100 text-green-700",
  ScalingReplicaSet: "bg-purple-100 text-purple-700",
};

function reasonBadge(reason) {
  const cls = REASON_COLORS[reason] || "bg-gray-100 text-gray-600";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {reason}
    </span>
  );
}

function relativeTime(ts) {
  if (!ts) return "-";
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const userNamespaces = getUserNamespaces();

  const fetchEvents = useCallback(async () => {
    try {
      const ns = userNamespaces.length ? `?namespace=${encodeURIComponent(userNamespaces.join(","))}` : "";
      const res = await fetch(`${API}/events${ns}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
      setLastRefresh(new Date());
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [userNamespaces.join(",")]);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 15000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); setExpandedRow(null); }, [filter, search, pageSize]);

  const filtered = events.filter(e => {
    if (filter === "warning" && e.type !== "Warning") return false;
    if (filter === "normal"  && e.type !== "Normal")  return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.object?.toLowerCase().includes(q) ||
        e.reason?.toLowerCase().includes(q) ||
        e.message?.toLowerCase().includes(q) ||
        e.namespace?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const warningCount = events.filter(e => e.type === "Warning").length;

  function goPage(p) {
    setCurrentPage(Math.max(1, Math.min(p, totalPages)));
    setExpandedRow(null);
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── STICKY HEADER + CONTROLS ─────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-slate-50 dark:bg-[#0b111b] -mx-4 md:-mx-6 px-4 md:px-6 pt-4 md:pt-5 pb-3 space-y-3 border-b border-slate-200">

        {/* Title row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Cluster Events</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {lastRefresh
                ? `Last updated ${relativeTime(lastRefresh)} · auto-refreshes every 15s`
                : "Loading…"}
              {userNamespaces.length > 0 && (
                <span className="ml-2 text-indigo-600 font-medium">· {userNamespaces.join(", ")}</span>
              )}
            </p>
          </div>
          <button
            onClick={fetchEvents}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Summary chips */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 border border-red-200">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-sm font-semibold text-red-700">{warningCount} Warnings</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-200">
            <Info size={16} className="text-green-600" />
            <span className="text-sm font-semibold text-green-700">{events.length - warningCount} Normal</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200">
            <span className="text-sm text-gray-500">
              {filtered.length} shown · {events.length} total
            </span>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5 text-sm">
            {["all", "warning", "normal"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md capitalize transition font-medium ${
                  filter === f
                    ? "bg-[#6366f1] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by pod, reason, message…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[220px] px-3 py-1.5 text-sm rounded-lg bg-white border border-slate-200 placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30"
          />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="hidden sm:inline">Rows:</span>
            <select
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              className="rounded-lg px-2 py-1.5 text-sm bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30"
            >
              {PAGE_SIZE_OPTIONS.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── TABLE ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-gray-400 text-sm py-12 text-center">Loading events…</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-400 text-sm py-12 text-center">No events found</div>
      ) : (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 w-24">Type</th>
                  <th className="px-4 py-3 w-36">Reason</th>
                  <th className="px-4 py-3 w-48">Object</th>
                  <th className="px-4 py-3 w-28">Namespace</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3 w-16">Count</th>
                  <th className="px-4 py-3 w-24">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((e, i) => {
                  const globalIdx = (safePage - 1) * pageSize + i;
                  const isExpanded = expandedRow === globalIdx;
                  return (
                    <React.Fragment key={globalIdx}>
                      <tr
                        onClick={() => setExpandedRow(isExpanded ? null : globalIdx)}
                        className={`transition cursor-pointer ${
                          e.type === "Warning" ? "bg-red-50/30 hover:bg-red-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          {e.type === "Warning" ? (
                            <span className="flex items-center gap-1 text-red-600 font-medium">
                              <AlertTriangle size={13} /> Warning
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-500">
                              <Info size={13} /> Normal
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">{reasonBadge(e.reason)}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-700 break-all">{e.object}</td>
                        <td className="px-4 py-3 text-gray-500">{e.namespace}</td>
                        <td className="px-4 py-3 text-gray-700">
                          <span className={isExpanded ? "whitespace-normal break-words" : "line-clamp-1 block"}>
                            {e.message}
                          </span>
                          {!isExpanded && e.message?.length > 80 && (
                            <span className="text-xs text-[#6366f1] font-medium mt-0.5 block">
                              Click to expand ↓
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{e.count}×</td>
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{relativeTime(e.lastTime)}</td>
                      </tr>
                      {isExpanded && (
                        <tr className={e.type === "Warning" ? "bg-red-50/60" : "bg-gray-50"}>
                          <td colSpan={7} className="px-6 py-3">
                            <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Full message</div>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{e.message}</p>
                            <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                              <span>Object: <b className="text-gray-700">{e.object}</b></span>
                              <span>Namespace: <b className="text-gray-700">{e.namespace}</b></span>
                              <span>Occurrences: <b className="text-gray-700">{e.count}×</b></span>
                              <span>Last seen: <b className="text-gray-700">{new Date(e.lastTime).toLocaleString()}</b></span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── PAGINATION CONTROLS ── */}
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-gray-500 flex-wrap gap-3">
            <span>
              Showing {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
              {Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goPage(1)}
                disabled={safePage === 1}
                className="px-2 py-1 rounded border text-xs disabled:opacity-40 hover:bg-gray-50 transition"
              >
                «
              </button>
              <button
                onClick={() => goPage(safePage - 1)}
                disabled={safePage === 1}
                className="p-1 rounded border disabled:opacity-40 hover:bg-gray-50 transition"
              >
                <ChevronLeft size={14} />
              </button>
              {/* Page number pills */}
              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-xs text-gray-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goPage(p)}
                      className={`px-3 py-1 rounded border text-xs transition ${
                        p === safePage
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => goPage(safePage + 1)}
                disabled={safePage === totalPages}
                className="p-1 rounded border disabled:opacity-40 hover:bg-gray-50 transition"
              >
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => goPage(totalPages)}
                disabled={safePage === totalPages}
                className="px-2 py-1 rounded border text-xs disabled:opacity-40 hover:bg-gray-50 transition"
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
