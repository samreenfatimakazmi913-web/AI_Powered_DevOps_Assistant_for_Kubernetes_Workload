import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Globe,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  UserMinus,
  Trash2,
  ChevronRight,
  Plus,
  Search,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  FolderOpen,
  X,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

const API = "/api";

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-[#E53935]/30 focus:border-[#E53935] " +
  "placeholder:text-[#6B7280] transition";

const selectCls =
  "w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-[#E53935]/30 focus:border-[#E53935] " +
  "text-[#1F2937] transition";

function Label({ children }) {
  return (
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
      {children}
    </label>
  );
}

function Avatar({ name, size = "sm" }) {
  const initials = name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div
      className={`${sz} rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0`}
    >
      {initials}
    </div>
  );
}

/* ── Namespace tag pill ── */
function NsBadge({ ns }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[11px] font-medium border border-indigo-100">
      {ns}
    </span>
  );
}

/* ── Edit Team Namespaces Modal ── */
function EditNamespacesModal({ team, allNamespaces, onSave, onClose }) {
  const [selected, setSelected] = useState(
    Array.isArray(team.namespaces) && team.namespaces.length
      ? team.namespaces
      : team.namespace
        ? [team.namespace]
        : [],
  );
  const [saving, setSaving] = useState(false);

  const toggle = (ns) =>
    setSelected((prev) =>
      prev.includes(ns) ? prev.filter((n) => n !== ns) : [...prev, ns],
    );

  const save = async () => {
    if (!selected.length) return alert("Select at least one namespace.");
    setSaving(true);
    const res = await fetch(`${API}/teams/${team._id}/namespaces`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ namespaces: selected }),
    });
    setSaving(false);
    if (!res.ok) return alert("Failed to update namespaces.");
    onSave();
  };

  return (
    <div
      className="
  fixed inset-0 z-50 flex items-center justify-center p-4
  bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-pink-500/30
"
    >
      <div
        className="
  w-full max-w-lg rounded-2xl overflow-hidden
  bg-white/70 backdrop-blur-xl
  border border-white/30
  shadow-[0_8px_40px_rgba(0,0,0,0.25)]
"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Edit Namespaces
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{team.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500">
            Select all namespaces this team can access:
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {allNamespaces.map((ns) => (
              <label
                key={ns}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition ${
                  selected.includes(ns)
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(ns)}
                  onChange={() => toggle(ns)}
                  className="rounded accent-indigo-600"
                />
                <span className="font-mono text-sm text-slate-700">{ns}</span>
                {selected.includes(ns) && (
                  <span className="ml-auto text-xs text-indigo-600 font-medium">
                    ✓ Selected
                  </span>
                )}
              </label>
            ))}
            {allNamespaces.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">
                No namespaces found in cluster
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 py-2.5 text-sm bg-[#E53935] hover:bg-[#C62828] text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [namespaces, setNamespaces] = useState([]);
  const [tab, setTab] = useState("teams");
  const [devSearch, setDevSearch] = useState("");
  const [showAddDev, setShowAddDev] = useState(false);

  const [showCreateTeam, setShowCreateTeam] = useState(false);

  const [teamForm, setTeamForm] = useState({ name: "", namespaces: [] });
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    teamId: "",
  });

  const [editingDev, setEditingDev] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", teamId: "" });
  const [editingTeamNs, setEditingTeamNs] = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  /* ── Close kebab on outside click ── */
  useEffect(() => {
    if (!openMenuId) return;
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpenMenuId(null);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  /* ── Data fetching ── */
  const fetchAll = () =>
    Promise.all([
      fetch(`${API}/teams`).then((r) => r.json()),
      fetch(`${API}/users`).then((r) => r.json()),
      fetch(`${API}/namespaces`).then((r) => r.json()),
    ])
      .then(([t, u, n]) => {
        setTeams(Array.isArray(t) ? t : []);
        setUsers(Array.isArray(u) ? u : []);
        setNamespaces(Array.isArray(n) ? n : []);
      })
      .catch(() => {
        setTeams([]);
        setUsers([]);
        setNamespaces([]);
      });

  useEffect(() => {
    fetchAll();
  }, []);

  /* ── Helpers ── */
  const developers = users.filter((u) => u.role === "developer");
  const getTeamDevs = (id) => developers.filter((d) => d.team?._id === id);
  const getTeamNs = (team) =>
    Array.isArray(team.namespaces) && team.namespaces.length
      ? team.namespaces
      : team.namespace
        ? [team.namespace]
        : [];

  const parseApiError = async (res) => {
    const text = await res.text();
    try {
      const b = JSON.parse(text);
      return b.message || b.error || text;
    } catch {
      return text || `Request failed (${res.status})`;
    }
  };

  /* ── CRUD ── */
  const createTeam = async () => {
    if (!teamForm.name || !teamForm.namespaces.length)
      return alert("Team name and at least one namespace are required");
    const res = await fetch(`${API}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamForm),
    });
    if (!res.ok) return alert(await parseApiError(res));
    await fetchAll();
    setTeamForm({ name: "", namespaces: [] });
  };

  const createUser = async () => {
    const { name, email, password } = userForm;
    if (!name || !email || !password) return alert("All fields required");
    const payload = { ...userForm, role: "developer" };
    if (!payload.teamId) delete payload.teamId;
    const res = await fetch(`${API}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return alert(await parseApiError(res));
    await fetchAll();
    setUserForm({ name: "", email: "", password: "", teamId: "" });
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this developer? This cannot be undone."))
      return;
    const res = await fetch(`${API}/users/${id}`, { method: "DELETE" });
    if (!res.ok) return alert(await parseApiError(res));
    setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  const openEdit = (dev) => {
    setEditingDev(dev);
    setEditForm({
      name: dev.name,
      email: dev.email,
      teamId: dev.team?._id || "",
    });
  };

  const saveEdit = async () => {
    const res = await fetch(`${API}/users/${editingDev._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (!res.ok) return alert(await parseApiError(res));
    setEditingDev(null);
    fetchAll();
  };

  const removeFromTeam = async (dev) => {
    if (
      !window.confirm(
        `Remove ${dev.name} from ${dev.team?.name || "their team"}?`,
      )
    )
      return;
    const res = await fetch(`${API}/users/${dev._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: dev.name, email: dev.email, teamId: "" }),
    });
    if (!res.ok) return alert(await parseApiError(res));
    setOpenMenuId(null);
    fetchAll();
  };

  /* ── Filtered developers ── */
  const filteredDevs = developers.filter(
    (d) =>
      !devSearch ||
      d.name.toLowerCase().includes(devSearch.toLowerCase()) ||
      d.email.toLowerCase().includes(devSearch.toLowerCase()),
  );

  /* ── Toggle namespace in create-team form ── */
  const toggleNsInForm = (ns) =>
    setTeamForm((prev) => ({
      ...prev,
      namespaces: prev.namespaces.includes(ns)
        ? prev.namespaces.filter((n) => n !== ns)
        : [...prev.namespaces, ns],
    }));

  /* ─────────────────── TABS ─────────────────── */
  const TABS = [
    { id: "teams", label: "Teams", icon: Users },
    { id: "developers", label: "Developers", icon: ShieldCheck },
    
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-4 md:pt-6">
      {/* ═══ EDIT DEVELOPER MODAL ═══ */}
      {editingDev && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">
                Edit Developer
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{editingDev.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Name</Label>
                <input
                  className={inputCls}
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <input
                  className={inputCls}
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Team</Label>
                <select
                  className={selectCls}
                  value={editForm.teamId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, teamId: e.target.value })
                  }
                >
                  <option value="">Unassigned</option>
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} — {getTeamNs(t).join(", ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={saveEdit}
                  className="flex-1 py-2.5 text-sm bg-[#E53935] hover:bg-[#C62828] text-white rounded-lg font-medium transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingDev(null)}
                  className="flex-1 py-2.5 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT TEAM NAMESPACES MODAL ═══ */}
      {editingTeamNs && (
        <EditNamespacesModal
          team={editingTeamNs}
          allNamespaces={namespaces}
          onSave={() => {
            setEditingTeamNs(null);
            fetchAll();
          }}
          onClose={() => setEditingTeamNs(null)}
        />
      )}

      {/* ═══ STATS BAR ═══ */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Teams", value: teams.length },
          { label: "Developers", value: developers.length },
          {
            label: "Namespaces",
            value: [...new Set(teams.flatMap((t) => getTeamNs(t)))].length,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="
    rounded-2xl 
    border border-border 
    px-6 py-6 
    bg-surface 
    shadow-md
    hover:shadow-xl
    hover:border-primary/40 
    hover:-translate-y-1.5 
    transition-all duration-300 
    cursor-pointer
  "
          >
            {" "}
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">
              {label}
            </p>
            <p className="text-4xl font-bold mt-2 text-text">{value}</p>
          </div>
        ))}
      </div>

      {/* ═══ TAB BAR ═══ */}
      <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              tab === id
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ═══ TAB CONTENT ═══ */}

      {/* ── Teams ── */}
      {tab === "teams" && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Teams</h2>

            <button
  onClick={() => setShowCreateTeam(true)}
  className="
    flex items-center gap-2 px-4 py-2 
    bg-primary text-white 
    hover:bg-primary/90 
    text-sm font-medium 
    rounded-lg 
    shadow-sm hover:shadow-md
    transition-all duration-200
  "
>
  <Plus size={16} />
  Add Team
</button>
          </div>
          {teams.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No teams yet</p>
              <p className="text-sm mt-1">
                Switch to "Create Team" to get started
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {teams.map((team) => {
                const devs = getTeamDevs(team._id);
                const nsArr = getTeamNs(team);
                return (
                  <div
                    key={team._id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Users size={18} className="text-indigo-600" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingTeamNs(team)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition"
                        >
                          <Pencil size={11} /> Edit NS
                        </button>
                        <button
                          onClick={() => navigate(`/admin/teams/${team._id}`)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                        >
                          Manage <ChevronRight size={11} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-slate-900">
                      {team.name}
                    </h3>

                    {/* Namespace badges */}
                    <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                      {nsArr.length ? (
                        nsArr.map((ns) => <NsBadge key={ns} ns={ns} />)
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Globe size={11} /> No namespaces
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          devs.length > 0
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {devs.length} member{devs.length !== 1 ? "s" : ""}
                      </span>
                      {devs.length > 0 && (
                        <div className="flex -space-x-1.5">
                          {devs.slice(0, 3).map((d) => (
                            <Avatar key={d._id} name={d.name} />
                          ))}
                          {devs.length > 3 && (
                            <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                              +{devs.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Developers ── */}
      {tab === "developers" && (
  <div className="space-y-4">

    {/* Header */}
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-900">
        Developers
      </h2>

      <button
        onClick={() => setShowAddDev(true)}
        className="
          flex items-center gap-2 px-4 py-2 
          bg-primary text-white 
          hover:bg-primary/90 
          text-sm font-medium 
          rounded-lg 
          shadow-sm hover:shadow-md
        "
      >
        <UserPlus size={16} />
        Add Developer
      </button>
    </div>

    {/* KEEP YOUR OLD TABLE BELOW */}
    <div className="bg-white border border-slate-200 rounded-2xl">
          {/* Search bar */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3 rounded-t-2xl">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              value={devSearch}
              onChange={(e) => setDevSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400"
            />
            {devSearch && (
              <button
                onClick={() => setDevSearch("")}
                className="text-xs text-slate-400 hover:text-slate-600 bg-transparent border-none"
              >
                Clear
              </button>
            )}
          </div>

          {filteredDevs.length === 0 ? (
            <div className="text-center py-16 text-slate-400 rounded-b-2xl">
              <ShieldCheck size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">
                {devSearch ? "No results found" : "No developers yet"}
              </p>
              <p className="text-sm mt-1">
                {devSearch
                  ? "Try a different search"
                  : "Switch to 'Add Developer' to create one"}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Developer</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-5 py-3 text-left">Team</th>
                  <th className="px-5 py-3 text-left hidden lg:table-cell">
                    Namespaces
                  </th>
                  <th className="px-5 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDevs.map((dev) => {
                  const isOpen = openMenuId === dev._id;
                  const teamNs = dev.team ? getTeamNs(dev.team) : [];
                  return (
                    <tr
                      key={dev._id}
                      className="hover:bg-slate-50 transition cursor-pointer"
                      onClick={() => navigate(`/admin/developers/${dev._id}`)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={dev.name} />
                          <span className="font-medium text-slate-800">
                            {dev.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">
                        {dev.email}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            dev.team?.name
                              ? "bg-indigo-50 text-indigo-700"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {dev.team?.name || "Unassigned"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {teamNs.length ? (
                            teamNs.map((ns) => <NsBadge key={ns} ns={ns} />)
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                      
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400 text-right rounded-b-2xl">
            {filteredDevs.length} developer
            {filteredDevs.length !== 1 ? "s" : ""}
          </div>
        </div>
        </div> 
      )}

      <AnimatePresence>
  {showAddDev && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => setShowAddDev(false)}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.25 }}
        className="
          relative z-10 w-full max-w-lg p-8 rounded-2xl
          bg-white/80 backdrop-blur-md
          border border-slate-200
          shadow-2xl
        "
      >

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            Add Developer
          </h2>

          <button
            onClick={() => setShowAddDev(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">

          <input
            placeholder="Full name"
            value={userForm.name}
            onChange={(e) =>
              setUserForm({ ...userForm, name: e.target.value })
            }
            className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200"
          />

          <input
            type="email"
            placeholder="Email"
            value={userForm.email}
            onChange={(e) =>
              setUserForm({ ...userForm, email: e.target.value })
            }
            className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200"
          />

          <input
            type="password"
            placeholder="Password"
            value={userForm.password}
            onChange={(e) =>
              setUserForm({ ...userForm, password: e.target.value })
            }
            className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200"
          />

          <select
            value={userForm.teamId}
            onChange={(e) =>
              setUserForm({ ...userForm, teamId: e.target.value })
            }
            className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200"
          >
            <option value="">No team</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            onClick={async () => {
              await createUser();
              setShowAddDev(false);
            }}
            className="
              w-full h-12 rounded-xl font-semibold text-white
              bg-primary hover:bg-primary/90
            "
          >
            Add Developer
          </button>

        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      <AnimatePresence>
  {showCreateTeam && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => setShowCreateTeam(false)}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="
          relative z-10 w-full max-w-lg p-8 rounded-2xl
          bg-white/80 backdrop-blur-md
          border border-slate-200
          shadow-2xl
        "
      >

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            Create Team
          </h2>

          <button
            onClick={() => setShowCreateTeam(false)}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">

          {/* Team Name */}
          <input
            type="text"
            placeholder="Team name"
            value={teamForm.name}
            onChange={(e) =>
              setTeamForm({ ...teamForm, name: e.target.value })
            }
            className="
              w-full h-12 px-4 rounded-xl
              bg-white border border-slate-200
              text-slate-800 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-primary/30
            "
          />

          {/* Namespaces */}
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {namespaces.map((ns) => (
              <label
                key={ns}
                className="
                  flex items-center gap-3 px-3 py-2 rounded-lg
                  bg-white border border-slate-200
                  hover:bg-slate-50
                  transition cursor-pointer
                "
              >
                <input
                  type="checkbox"
                  checked={teamForm.namespaces.includes(ns)}
                  onChange={() => toggleNsInForm(ns)}
                  className="accent-primary"
                />
                <span className="text-sm text-slate-700 font-mono">
                  {ns}
                </span>
              </label>
            ))}
          </div>

          {/* Button */}
          <button
            onClick={async () => {
              await createTeam();
              setShowCreateTeam(false);
            }}
            className="
              w-full h-12 rounded-xl font-semibold text-white
              bg-primary hover:bg-primary/90
              shadow-md hover:shadow-lg
              transition
            "
          >
            Create Team
          </button>

        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
}
