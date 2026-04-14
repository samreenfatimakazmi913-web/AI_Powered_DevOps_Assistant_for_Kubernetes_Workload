import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Users, Globe, MoreHorizontal,
  Pencil, RefreshCw, UserMinus, Trash2,
  UserPlus, CheckCircle, XCircle, Plus, X,
} from "lucide-react";

const API = "http://localhost:5000/api";

const inputCls =
  "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 " +
  "placeholder:text-slate-400 transition";

const selectCls =
  "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 " +
  "text-slate-700 transition";

function Label({ children }) {
  return (
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
      {children}
    </label>
  );
}

function Avatar({ name }) {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
      {initials}
    </div>
  );
}

/* ── Edit modal ── */
function EditModal({ dev, teams, onSave, onClose }) {
  const [form, setForm]   = useState({ name: dev.name, email: dev.email, teamId: dev.team?._id || "" });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`${API}/users/${dev._id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) return alert("Failed to save changes.");
    onSave();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Edit Developer</h2>
          <p className="text-xs text-slate-500 mt-0.5">{dev.name}</p>
        </div>
        <div className="p-6 space-y-4">
          <div><Label>Name</Label><input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Email</Label><input className={inputCls} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div>
            <Label>Team</Label>
            <select className={selectCls} value={form.teamId} onChange={e => setForm({ ...form, teamId: e.target.value })}>
              <option value="">Unassigned</option>
              {teams.map(t => <option key={t._id} value={t._id}>{t.name} — {t.namespace}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={save} disabled={saving}
              className="flex-1 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition disabled:opacity-50">
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button onClick={onClose}
              className="flex-1 py-2.5 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function TeamDetailPage() {
  const { teamId } = useParams();
  const navigate   = useNavigate();

  const [team, setTeam]         = useState(null);
  const [teamDevs, setTeamDevs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [teams, setTeams]       = useState([]);
  const [loading, setLoading]   = useState(true);

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const [editingDev, setEditingDev] = useState(null);
  const [showAssign, setShowAssign] = useState(false);
  const [assignId, setAssignId]     = useState("");
  const [assigning, setAssigning]   = useState(false);
  const [showNsEdit, setShowNsEdit] = useState(false);
  const [nsToAdd, setNsToAdd]       = useState("");
  const [allNamespaces, setAllNamespaces] = useState([]);

  const getTeamNs = (t) =>
    Array.isArray(t?.namespaces) && t.namespaces.length
      ? t.namespaces
      : t?.namespace ? [t.namespace] : [];

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, uRes, nsRes] = await Promise.all([
        fetch(`${API}/teams`).then(r => r.json()),
        fetch(`${API}/users`).then(r => r.json()),
        fetch(`${API}/namespaces`).then(r => r.json()).catch(() => []),
      ]);
      const teamsArr = Array.isArray(tRes) ? tRes : [];
      const usersArr = Array.isArray(uRes) ? uRes : [];
      setTeams(teamsArr);
      setAllUsers(usersArr);
      setAllNamespaces(Array.isArray(nsRes) ? nsRes : []);
      setTeam(teamsArr.find(t => t._id === teamId) || null);
      setTeamDevs(usersArr.filter(u => u.role === "developer" && u.team?._id === teamId));
    } catch { setTeam(null); }
    finally   { setLoading(false); }
  }, [teamId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!openMenuId) return;
    function h(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [openMenuId]);

  async function patchUser(userId, patch) {
    const res = await fetch(`${API}/users/${userId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) { alert("Operation failed."); return false; }
    return true;
  }

  async function removeFromTeam(dev) {
    if (!window.confirm(`Remove ${dev.name} from this team?`)) return;
    if (await patchUser(dev._id, { name: dev.name, email: dev.email, teamId: "" })) {
      setOpenMenuId(null); fetchAll();
    }
  }

  async function deleteDeveloper(dev) {
    if (!window.confirm(`Permanently delete ${dev.name}?`)) return;
    const res = await fetch(`${API}/users/${dev._id}`, { method: "DELETE" });
    if (!res.ok) return alert("Delete failed.");
    setOpenMenuId(null); fetchAll();
  }

  async function assignDeveloper() {
    if (!assignId) return;
    const dev = allUsers.find(u => u._id === assignId);
    if (!dev) return;
    setAssigning(true);
    if (await patchUser(dev._id, { name: dev.name, email: dev.email, teamId })) {
      setAssignId(""); setShowAssign(false); fetchAll();
    }
    setAssigning(false);
  }

  const unassignedDevs = allUsers.filter(u => u.role === "developer" && (!u.team || !u.team._id));

  /* ── Namespace management ── */
  const updateTeamNamespaces = async (nsArr) => {
    const res = await fetch(`${API}/teams/${teamId}/namespaces`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ namespaces: nsArr }),
    });
    if (!res.ok) { alert("Failed to update namespaces."); return false; }
    return true;
  };

  const addNsToTeam = async () => {
    if (!nsToAdd) return;
    const current = getTeamNs(team);
    if (current.includes(nsToAdd)) return;
    if (await updateTeamNamespaces([...current, nsToAdd])) {
      setNsToAdd(""); fetchAll();
    }
  };

  const removeNsFromTeam = async (ns) => {
    const current = getTeamNs(team);
    if (current.length <= 1) return alert("A team must have at least one namespace.");
    if (!window.confirm(`Remove namespace "${ns}" from this team?`)) return;
    await updateTeamNamespaces(current.filter(n => n !== ns));
    fetchAll();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-400 text-sm animate-pulse">Loading team…</div>;
  }

  if (!team) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate("/admin")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft size={16} /> Back to Admin Panel
        </button>
        <p className="text-red-500 text-sm">Team not found.</p>
      </div>
    );
  }

  return (
    <>
      {editingDev && (
        <EditModal dev={editingDev} teams={teams}
          onSave={() => { setEditingDev(null); fetchAll(); }}
          onClose={() => setEditingDev(null)} />
      )}

      <div className="space-y-6 max-w-4xl pt-4 md:pt-6">

        {/* Back link */}
        <button onClick={() => navigate("/admin")}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition">
          <ArrowLeft size={15} /> Back to Admin Panel
        </button>

        {/* Team header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Users size={22} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{team.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 mt-1 inline-block">
                  {teamDevs.length} member{teamDevs.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <button onClick={() => setShowAssign(v => !v)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">
              <UserPlus size={15} />
              Assign Developer
            </button>
          </div>

          {/* Namespaces section */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Globe size={12} /> Namespaces
              </span>
              <button onClick={() => setShowNsEdit(v => !v)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 bg-transparent border-none transition">
                <Pencil size={11} /> {showNsEdit ? "Done" : "Edit"}
              </button>
            </div>

            {/* Show badges */}
            <div className="flex flex-wrap gap-1.5">
              {getTeamNs(team).map(ns => (
                <span key={ns} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono text-xs font-medium border border-indigo-100">
                  {ns}
                  {showNsEdit && (
                    <button onClick={() => removeNsFromTeam(ns)}
                      className="text-indigo-400 hover:text-red-500 transition bg-transparent border-none p-0 ml-0.5">
                      <X size={11} />
                    </button>
                  )}
                </span>
              ))}
              {getTeamNs(team).length === 0 && (
                <span className="text-xs text-slate-400">No namespaces assigned</span>
              )}
            </div>

            {/* Add namespace picker */}
            {showNsEdit && (
              <div className="mt-3 flex items-center gap-2">
                <select
                  value={nsToAdd}
                  onChange={e => setNsToAdd(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                >
                  <option value="">Add a namespace…</option>
                  {allNamespaces.filter(ns => !getTeamNs(team).includes(ns)).map(ns => (
                    <option key={ns} value={ns}>{ns}</option>
                  ))}
                </select>
                <button onClick={addNsToTeam} disabled={!nsToAdd}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50">
                  <Plus size={14} /> Add
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Assign panel */}
        {showAssign && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Assign an unassigned developer to this team</h3>
            {unassignedDevs.length === 0 ? (
              <p className="text-sm text-slate-400">No unassigned developers available.</p>
            ) : (
              <div className="flex items-center gap-3">
                <select value={assignId} onChange={e => setAssignId(e.target.value)}
                  className={`flex-1 ${selectCls}`}>
                  <option value="">Select a developer…</option>
                  {unassignedDevs.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                </select>
                <button onClick={assignDeveloper} disabled={!assignId || assigning}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50">
                  <CheckCircle size={14} /> {assigning ? "Assigning…" : "Assign"}
                </button>
                <button onClick={() => { setShowAssign(false); setAssignId(""); }}
                  className="p-2 text-slate-400 hover:text-slate-600 transition">
                  <XCircle size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Members table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Team Members</h2>
          </div>

          {teamDevs.length === 0 ? (
            <div className="px-6 py-14 text-center text-slate-400 text-sm">
              <Users size={32} className="mx-auto mb-3 opacity-20" />
              No developers assigned yet.
              <button onClick={() => setShowAssign(true)}
                className="block mx-auto mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition">
                Assign a developer →
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                  <th className="px-6 py-3 text-left">Developer</th>
                  <th className="px-6 py-3 text-left hidden md:table-cell">Email</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamDevs.map(dev => {
                  const isOpen = openMenuId === dev._id;
                  return (
                    <tr key={dev._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={dev.name} />
                          <span className="font-medium text-slate-800">{dev.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 hidden md:table-cell">{dev.email}</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">Active</span>
                      </td>
                      <td className="px-4 py-3.5 text-right overflow-visible">
                        <div className="relative inline-block" ref={isOpen ? menuRef : null}>
                          <button onClick={() => setOpenMenuId(isOpen ? null : dev._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                            <MoreHorizontal size={16} />
                          </button>
                          {isOpen && (
                            <div className="absolute right-0 top-9 z-[100] w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1 text-sm overflow-hidden">
                              <button onClick={() => { setOpenMenuId(null); setEditingDev(dev); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition">
                                <Pencil size={13} className="text-slate-400" /> Edit Details
                              </button>
                              <button onClick={() => { setOpenMenuId(null); setEditingDev(dev); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition">
                                <RefreshCw size={13} className="text-slate-400" /> Change Team
                              </button>
                              <button onClick={() => removeFromTeam(dev)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-amber-600 hover:bg-amber-50 transition">
                                <UserMinus size={13} className="text-amber-400" /> Remove from Team
                              </button>
                              <div className="my-1 border-t border-slate-100" />
                              <button onClick={() => deleteDeveloper(dev)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-red-600 hover:bg-red-50 transition">
                                <Trash2 size={13} className="text-red-400" /> Delete Developer
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400 text-right">
            {teamDevs.length} member{teamDevs.length !== 1 ? "s" : ""}
          </div>
        </div>

      </div>
    </>
  );
}
