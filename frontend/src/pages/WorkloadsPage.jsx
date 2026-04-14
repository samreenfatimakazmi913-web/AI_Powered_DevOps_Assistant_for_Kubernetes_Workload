import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { RefreshCw, ScrollText, ChevronRight, Search, X } from "lucide-react";

const API = "http://localhost:5000/api";

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
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.role === "admin";
  } catch {}
  return false;
}

const TABS = [
  { key: "deployments",  label: "Deployments" },
  { key: "pods",         label: "Pods" },
  { key: "jobs",         label: "Jobs" },
  { key: "cronjobs",    label: "CronJobs" },
  { key: "daemonsets",  label: "DaemonSets" },
  { key: "statefulsets", label: "StatefulSets" },
  { key: "namespaces",  label: "Namespaces" },
  { key: "volumes",     label: "Volumes" },
];

// Tabs that expose a "status" filter
const STATUS_FILTERABLE = new Set(["deployments", "pods", "daemonsets", "statefulsets", "jobs"]);

function age(ts) {
  if (!ts) return "-";
  const s = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (s < 60)   return `${s}s`;
  if (s < 3600)  return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function StatusBadge({ ok, label }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
      ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}>
      {label}
    </span>
  );
}

function EmptyRow({ cols }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center text-gray-400 text-sm">
        No resources found
      </td>
    </tr>
  );
}

/* ── helpers for status determination per resource type ── */
function deploymentStatus(d) {
  const desired = d.spec?.replicas ?? 1;
  const ready   = d.status?.readyReplicas ?? 0;
  return ready === desired ? "healthy" : "degraded";
}
function podStatus(p) {
  const cs          = p.status?.containerStatuses || [];
  const readyCount  = cs.filter(c => c.ready).length;
  const totalCount  = cs.length;
  const phase       = p.status?.phase;
  if (phase === "Succeeded") return "healthy";
  if (phase === "Running" && readyCount === totalCount && totalCount > 0) return "healthy";
  if (phase === "Pending")  return "pending";
  return "degraded";
}
function daemonsetStatus(d) {
  const desired = d.status?.desiredNumberScheduled ?? 0;
  const ready   = d.status?.numberReady ?? 0;
  return (ready === desired && desired > 0) ? "healthy" : "degraded";
}
function statefulsetStatus(s) {
  const desired = s.spec?.replicas ?? 1;
  const ready   = s.status?.readyReplicas ?? 0;
  return ready === desired ? "healthy" : "degraded";
}
function jobStatus(j) {
  const succeeded = j.status?.succeeded ?? 0;
  const desired   = j.spec?.completions ?? 1;
  const failed    = j.status?.failed ?? 0;
  const active    = j.status?.active ?? 0;
  if (succeeded >= desired) return "healthy";
  if (failed > 0)           return "degraded";
  if (active > 0)           return "pending";
  return "pending";
}

/* ─────────────── DEPLOYMENTS ─────────────── */
function DeploymentsTab({ data }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
          <th className="px-4 py-3">Name</th>
          <th className="px-4 py-3">Namespace</th>
          <th className="px-4 py-3">Ready</th>
          <th className="px-4 py-3">Up-to-date</th>
          <th className="px-4 py-3">Available</th>
          <th className="px-4 py-3">Strategy</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Age</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.length === 0 ? <EmptyRow cols={8} /> : data.map((d, i) => {
          const desired   = d.spec?.replicas ?? 1;
          const ready     = d.status?.readyReplicas ?? 0;
          const updated   = d.status?.updatedReplicas ?? 0;
          const available = d.status?.availableReplicas ?? 0;
          const healthy   = ready === desired;
          return (
            <tr key={i} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-medium text-gray-800">{d.metadata?.name}</td>
              <td className="px-4 py-3 text-gray-500">{d.metadata?.namespace}</td>
              <td className="px-4 py-3 font-mono">
                <span className={ready === desired ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {ready}/{desired}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">{updated}</td>
              <td className="px-4 py-3 text-gray-600">{available}</td>
              <td className="px-4 py-3 text-gray-500 capitalize">{d.spec?.strategy?.type || "-"}</td>
              <td className="px-4 py-3">
                <StatusBadge ok={healthy} label={healthy ? "Healthy" : "Degraded"} />
              </td>
              <td className="px-4 py-3 text-gray-400">{age(d.metadata?.creationTimestamp)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ─────────────── PODS ─────────────── */
function PodsTab({ data }) {
  const navigate = useNavigate();
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
          <th className="px-4 py-3">Name</th>
          <th className="px-4 py-3">Namespace</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Ready</th>
          <th className="px-4 py-3">Restarts</th>
          <th className="px-4 py-3">Node</th>
          <th className="px-4 py-3">Age</th>
          <th className="px-4 py-3">Logs</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.length === 0 ? <EmptyRow cols={8} /> : data.map((p, i) => {
          const cs         = p.status?.containerStatuses || [];
          const readyCount = cs.filter(c => c.ready).length;
          const totalCount = cs.length;
          const restarts   = cs.reduce((s, c) => s + (c.restartCount || 0), 0);
          const phase      = p.status?.phase;
          const badReason  = cs.find(c => !c.ready)?.state?.waiting?.reason
                          || cs.find(c => !c.ready)?.state?.terminated?.reason;
          const statusLabel = badReason || phase || "Unknown";
          const healthy    = phase === "Running" && readyCount === totalCount && totalCount > 0;
          const succeeded  = phase === "Succeeded";
          return (
            <tr key={i} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-mono text-xs text-gray-800 break-all">{p.metadata?.name}</td>
              <td className="px-4 py-3 text-gray-500">{p.metadata?.namespace}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  healthy || succeeded   ? "bg-green-100 text-green-700"
                  : phase === "Pending" ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
                }`}>
                  {statusLabel}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs">{totalCount ? `${readyCount}/${totalCount}` : "-"}</td>
              <td className="px-4 py-3">
                {restarts > 0
                  ? <span className="text-red-600 font-semibold">{restarts}×</span>
                  : <span className="text-gray-400">-</span>}
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">{p.spec?.nodeName || "-"}</td>
              <td className="px-4 py-3 text-gray-400">{age(p.metadata?.creationTimestamp)}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => navigate(`/logs?ns=${p.metadata?.namespace}&pod=${p.metadata?.name}`)}
                  className="flex items-center gap-1 text-xs text-[#6366f1] hover:underline font-medium"
                >
                  <ScrollText size={12} /> Logs
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ─────────────── JOBS ─────────────── */
function JobsTab({ data }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
          <th className="px-4 py-3">Name</th>
          <th className="px-4 py-3">Namespace</th>
          <th className="px-4 py-3">Completions</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Duration</th>
          <th className="px-4 py-3">Age</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.length === 0 ? <EmptyRow cols={6} /> : data.map((j, i) => {
          const succeeded = j.status?.succeeded ?? 0;
          const desired   = j.spec?.completions ?? 1;
          const failed    = j.status?.failed ?? 0;
          const active    = j.status?.active ?? 0;
          const start     = j.status?.startTime;
          const end       = j.status?.completionTime;
          const durationS = start && end
            ? Math.floor((new Date(end) - new Date(start)) / 1000)
            : start ? Math.floor((Date.now() - new Date(start)) / 1000) : null;
          const durLabel  = durationS == null ? "-"
            : durationS < 60   ? `${durationS}s`
            : durationS < 3600 ? `${Math.floor(durationS / 60)}m`
            : `${Math.floor(durationS / 3600)}h`;
          const status    = succeeded >= desired ? "Completed" : failed > 0 ? "Failed" : active > 0 ? "Running" : "Pending";
          return (
            <tr key={i} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-medium text-gray-800">{j.metadata?.name}</td>
              <td className="px-4 py-3 text-gray-500">{j.metadata?.namespace}</td>
              <td className="px-4 py-3 font-mono text-xs">
                <span className={succeeded >= desired ? "text-green-600 font-semibold" : "text-gray-600"}>
                  {succeeded}/{desired}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  status === "Completed" ? "bg-green-100 text-green-700"
                  : status === "Failed"  ? "bg-red-100 text-red-700"
                  : status === "Running" ? "bg-blue-100 text-blue-700"
                  : "bg-yellow-100 text-yellow-700"
                }`}>{status}</span>
              </td>
              <td className="px-4 py-3 text-gray-500">{durLabel}</td>
              <td className="px-4 py-3 text-gray-400">{age(j.metadata?.creationTimestamp)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ─────────────── CRONJOBS ─────────────── */
function CronJobsTab({ data }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
          <th className="px-4 py-3">Name</th>
          <th className="px-4 py-3">Namespace</th>
          <th className="px-4 py-3">Schedule</th>
          <th className="px-4 py-3">Last Run</th>
          <th className="px-4 py-3">Active</th>
          <th className="px-4 py-3">Suspended</th>
          <th className="px-4 py-3">Age</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.length === 0 ? <EmptyRow cols={7} /> : data.map((c, i) => {
          const suspended = c.spec?.suspend;
          const active    = c.status?.active?.length ?? 0;
          return (
            <tr key={i} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-medium text-gray-800">{c.metadata?.name}</td>
              <td className="px-4 py-3 text-gray-500">{c.metadata?.namespace}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-700">{c.spec?.schedule || "-"}</td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {c.status?.lastScheduleTime ? age(c.status.lastScheduleTime) + " ago" : "Never"}
              </td>
              <td className="px-4 py-3 text-gray-600">{active}</td>
              <td className="px-4 py-3">
                {suspended
                  ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Suspended</span>
                  : <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>}
              </td>
              <td className="px-4 py-3 text-gray-400">{age(c.metadata?.creationTimestamp)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ─────────────── DAEMONSETS ─────────────── */
function DaemonSetsTab({ data }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
          <th className="px-4 py-3">Name</th>
          <th className="px-4 py-3">Namespace</th>
          <th className="px-4 py-3">Desired</th>
          <th className="px-4 py-3">Ready</th>
          <th className="px-4 py-3">Available</th>
          <th className="px-4 py-3">Up-to-date</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Age</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.length === 0 ? <EmptyRow cols={8} /> : data.map((d, i) => {
          const desired   = d.status?.desiredNumberScheduled ?? 0;
          const ready     = d.status?.numberReady ?? 0;
          const available = d.status?.numberAvailable ?? 0;
          const updated   = d.status?.updatedNumberScheduled ?? 0;
          const healthy   = ready === desired && desired > 0;
          return (
            <tr key={i} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-medium text-gray-800">{d.metadata?.name}</td>
              <td className="px-4 py-3 text-gray-500">{d.metadata?.namespace}</td>
              <td className="px-4 py-3 font-mono text-xs">{desired}</td>
              <td className="px-4 py-3 font-mono text-xs">
                <span className={ready === desired ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {ready}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">{available}</td>
              <td className="px-4 py-3 text-gray-600">{updated}</td>
              <td className="px-4 py-3">
                <StatusBadge ok={healthy} label={healthy ? "Healthy" : "Degraded"} />
              </td>
              <td className="px-4 py-3 text-gray-400">{age(d.metadata?.creationTimestamp)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ─────────────── STATEFULSETS ─────────────── */
function StatefulSetsTab({ data }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
          <th className="px-4 py-3">Name</th>
          <th className="px-4 py-3">Namespace</th>
          <th className="px-4 py-3">Ready</th>
          <th className="px-4 py-3">Service</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Age</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.length === 0 ? <EmptyRow cols={6} /> : data.map((s, i) => {
          const desired = s.spec?.replicas ?? 1;
          const ready   = s.status?.readyReplicas ?? 0;
          const healthy = ready === desired;
          return (
            <tr key={i} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-medium text-gray-800">{s.metadata?.name}</td>
              <td className="px-4 py-3 text-gray-500">{s.metadata?.namespace}</td>
              <td className="px-4 py-3 font-mono text-xs">
                <span className={healthy ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {ready}/{desired}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">{s.spec?.serviceName || "-"}</td>
              <td className="px-4 py-3">
                <StatusBadge ok={healthy} label={healthy ? "Healthy" : "Degraded"} />
              </td>
              <td className="px-4 py-3 text-gray-400">{age(s.metadata?.creationTimestamp)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ─────────────── NAMESPACES ─────────────── */
function NamespacesTab({ data }) {
  const navigate = useNavigate();
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
          <th className="px-4 py-3">Name</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Age</th>
          <th className="px-4 py-3">Events</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.length === 0 ? <EmptyRow cols={4} /> : data.map((ns, i) => {
          const name   = typeof ns === "string" ? ns : ns.metadata?.name;
          const status = typeof ns === "string" ? "Active" : ns.status?.phase;
          const ts     = typeof ns === "string" ? null : ns.metadata?.creationTimestamp;
          return (
            <tr key={i} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-medium text-gray-800">{name}</td>
              <td className="px-4 py-3">
                <StatusBadge ok={status === "Active"} label={status || "Active"} />
              </td>
              <td className="px-4 py-3 text-gray-400">{ts ? age(ts) : "-"}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => navigate(`/events?ns=${name}`)}
                  className="flex items-center gap-1 text-xs text-[#6366f1] hover:underline font-medium"
                >
                  View events <ChevronRight size={12} />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ─────────────── VOLUMES (PersistentVolumes) ─────────────── */
function VolumesTab({ data }) {
  const phaseColor = (phase) => {
    if (phase === "Bound")     return "bg-green-100 text-green-700";
    if (phase === "Available") return "bg-blue-100 text-blue-700";
    if (phase === "Released")  return "bg-amber-100 text-amber-700";
    if (phase === "Failed")    return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-500";
  };

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
          <th className="px-4 py-3">Name</th>
          <th className="px-4 py-3">Capacity</th>
          <th className="px-4 py-3">Phase</th>
          <th className="px-4 py-3">Access Modes</th>
          <th className="px-4 py-3">Storage Class</th>
          <th className="px-4 py-3">Reclaim Policy</th>
          <th className="px-4 py-3">Bound To</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.length === 0 ? (
          <tr>
            <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
              No persistent volumes found
            </td>
          </tr>
        ) : data.map((v, i) => (
          <tr key={i} className="hover:bg-gray-50 transition">
            <td className="px-4 py-3 font-mono text-xs text-gray-800">{v.name}</td>
            <td className="px-4 py-3 font-semibold text-slate-700">{v.capacity}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${phaseColor(v.phase)}`}>
                {v.phase}
              </span>
            </td>
            <td className="px-4 py-3 text-gray-500 font-mono text-xs">{v.accessModes || "-"}</td>
            <td className="px-4 py-3 text-gray-500">{v.storageClass || "-"}</td>
            <td className="px-4 py-3 text-gray-500 capitalize">{v.reclaimPolicy || "-"}</td>
            <td className="px-4 py-3 text-gray-500 font-mono text-xs">
              {v.claimName
                ? <><span className="text-indigo-600">{v.claimNamespace}/</span>{v.claimName}</>
                : <span className="text-slate-300 italic">unbound</span>
              }
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── per-item status string (for filter) ── */
function getItemStatus(item, tab) {
  if (tab === "deployments")  return deploymentStatus(item);
  if (tab === "pods")         return podStatus(item);
  if (tab === "daemonsets")   return daemonsetStatus(item);
  if (tab === "statefulsets") return statefulsetStatus(item);
  if (tab === "jobs")         return jobStatus(item);
  return "healthy";
}

/* ─────────────── MAIN PAGE ─────────────── */
export default function WorkloadsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "deployments";
  const adminUser = isAdmin();

  const [rawData, setRawData]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Filters
  const [search, setSearch]           = useState("");
  const [nsFilter, setNsFilter]       = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const userNamespaces = getUserNamespaces();
  const nsQuery = userNamespaces.length ? `?namespace=${encodeURIComponent(userNamespaces.join(","))}` : "";

  const endpointMap = {
    deployments:  `${API}/deployments${nsQuery}`,
    pods:         `${API}/pods${nsQuery}`,
    jobs:         `${API}/jobs${nsQuery}`,
    cronjobs:     `${API}/cronjobs${nsQuery}`,
    daemonsets:   `${API}/daemonsets${nsQuery}`,
    statefulsets: `${API}/statefulsets${nsQuery}`,
    namespaces:   `${API}/namespaces${nsQuery}`,
    volumes:      `${API}/volumes${nsQuery}`,
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(endpointMap[activeTab]);
      const raw = await res.json();
      setRawData(Array.isArray(raw) ? raw : []);
      setLastRefresh(new Date());
    } catch {
      setRawData([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, nsQuery]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset filters when tab changes
  useEffect(() => {
    setSearch("");
    setNsFilter("all");
    setStatusFilter("all");
  }, [activeTab]);

  function setTab(key) {
    setSearchParams({ tab: key });
    setRawData([]);
  }

  // Unique namespaces from raw data (for admin namespace filter)
  const availableNamespaces = useMemo(() => {
    if (!adminUser) return [];
    const ns = new Set(rawData.map(item => item.metadata?.namespace).filter(Boolean));
    return [...ns].sort();
  }, [rawData, adminUser]);

  // Apply filters
  const filtered = useMemo(() => {
    return rawData.filter(item => {
      // Volumes use a flat shape; everything else uses item.metadata
      const isFlat = activeTab === "volumes" || typeof item === "string";
      const name   = isFlat ? (item.name || item) : (item.metadata?.name  || "");
      const ns     = isFlat ? (item.claimNamespace || "") : (item.metadata?.namespace || "");

      if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
      if (nsFilter !== "all" && ns !== nsFilter) return false;
      if (statusFilter !== "all" && STATUS_FILTERABLE.has(activeTab)) {
        const s = getItemStatus(item, activeTab);
        if (statusFilter === "healthy"  && s !== "healthy")  return false;
        if (statusFilter === "degraded" && s === "healthy")  return false;
        if (statusFilter === "pending"  && s !== "pending")  return false;
      }
      return true;
    });
  }, [rawData, search, nsFilter, statusFilter, activeTab]);

  const currentLabel = TABS.find(t => t.key === activeTab)?.label || "";
  const showStatusFilter = STATUS_FILTERABLE.has(activeTab);

  const hasActiveFilter = search || nsFilter !== "all" || statusFilter !== "all";

  function clearFilters() {
    setSearch("");
    setNsFilter("all");
    setStatusFilter("all");
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── STICKY HEADER + TABS ───────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-surfaceSoft -mx-4 md:-mx-6 px-4 md:px-6 pt-4 md:pt-5 pb-3 space-y-3 border-b border-border">

        {/* Title row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Workloads</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {lastRefresh
                ? `Updated ${Math.floor((Date.now() - lastRefresh) / 1000)}s ago`
                : "Loading…"}
              {userNamespaces.length > 0 && (
                <span className="ml-2 text-indigo-600 font-medium">· {userNamespaces.join(", ")}</span>
              )}
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 flex-wrap border-b border-gray-200">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition -mb-px border-b-2 ${
                activeTab === t.key
                  ? "border-primary text-primary bg-surface"
                  : "border-transparent text-muted hover:text-text hover:bg-surface"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 items-center pb-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${currentLabel.toLowerCase()}…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm rounded-lg bg-surface border border-border placeholder-muted text-text focus:outline-none focus:ring-2 focus:ring-primary/30 w-56"
            />
          </div>

          {/* Namespace filter – admins only */}
          {adminUser && availableNamespaces.length > 0 && (
            <select
              value={nsFilter}
              onChange={e => setNsFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30"
            >
              <option value="all">All namespaces</option>
              {availableNamespaces.map(ns => (
                <option key={ns} value={ns}>{ns}</option>
              ))}
            </select>
          )}

          {/* Status filter */}
          {showStatusFilter && (
            <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5 text-sm">
              {["all", "healthy", "degraded", ...(activeTab === "pods" || activeTab === "jobs" ? ["pending"] : [])].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-md capitalize transition font-medium ${
                    statusFilter === s
                      ? "bg-[#6366f1] text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Clear filters button */}
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs text-slate-500 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
            >
              <X size={12} /> Clear
            </button>
          )}

          <span className="text-xs text-gray-400 ml-auto">
            {filtered.length} / {rawData.length} {currentLabel.toLowerCase()}
          </span>
        </div>
      </div>

      {/* ── TABLE ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-surface shadow-soft overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading {currentLabel}…</div>
        ) : (
          <>
            {activeTab === "deployments"  && <DeploymentsTab  data={filtered} />}
            {activeTab === "pods"         && <PodsTab          data={filtered} />}
            {activeTab === "jobs"         && <JobsTab          data={filtered} />}
            {activeTab === "cronjobs"     && <CronJobsTab      data={filtered} />}
            {activeTab === "daemonsets"   && <DaemonSetsTab    data={filtered} />}
            {activeTab === "statefulsets" && <StatefulSetsTab  data={filtered} />}
            {activeTab === "namespaces"   && <NamespacesTab    data={filtered} />}
            {activeTab === "volumes"      && <VolumesTab       data={filtered} />}
          </>
        )}
        <div className="px-4 py-2 border-t text-xs text-gray-400 text-right">
          {filtered.length} {currentLabel.toLowerCase()}
          {hasActiveFilter && rawData.length !== filtered.length
            ? ` (filtered from ${rawData.length})`
            : ""}
        </div>
      </div>
    </div>
  );
}
