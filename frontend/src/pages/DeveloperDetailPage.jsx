import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Users,
  Globe,
  ShieldCheck,
  Calendar,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";

const API = "http://localhost:5000/api";

export default function DeveloperDetailPage() {
  const { developerId } = useParams();
  const navigate = useNavigate();

  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", teamId: "" });
  const [saving, setSaving] = useState(false);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    const fetchDeveloper = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API}/users/${developerId}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed (${res.status})`);
        }
        const data = await res.json();
        setDeveloper(data);
      } catch (err) {
        console.error("Failed to load developer", err);
        setError("Failed to load developer profile.");
      } finally {
        setLoading(false);
      }
    };

    if (developerId) fetchDeveloper();
  }, [developerId]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchTeams = async () => {
      try {
        const res = await fetch(`${API}/teams`);
        if (res.ok) {
          const data = await res.json();
          setTeams(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch teams", err);
      }
    };
    fetchTeams();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="text-center py-20 text-muted">Loading developer profile...</div>
    );
  }

  if (!developer) {
    return (
      <div className="text-center py-20 text-muted">
        Developer not found
        <button
          onClick={() => navigate("/admin")}
          className="block mx-auto mt-4 px-4 py-2 bg-surface border border-border rounded-lg"
        >
          Go back
        </button>
      </div>
    );
  }

  const initials = developer.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const namespaces =
    developer.team?.namespaces ||
    (developer.team?.namespace ? [developer.team.namespace] : []);

  const createdAt = developer.createdAt
    ? new Date(developer.createdAt).toLocaleDateString()
    : null;

  const uploadsBase = API.replace(/\/api$/, "");

  const openEdit = () => {
    setEditForm({
      name: developer.name || "",
      email: developer.email || "",
      teamId: developer.team?._id || "",
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const payload = { ...editForm };
      const res = await fetch(`${API}/users/${developer._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Request failed (${res.status})`);
      }
      const updated = await res.json();
      setDeveloper(updated);
      setEditOpen(false);
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const deleteDeveloper = async () => {
    if (!window.confirm("Delete this developer? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API}/users/${developer._id}`, { method: "DELETE" });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Request failed (${res.status})`);
      }
      navigate("/admin");
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete developer.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/admin")}
        className="flex items-center gap-2 text-muted hover:text-text transition"
      >
        <ArrowLeft size={16} />
        Back to Admin
      </button>

      {/* MAIN CARD */}
      <div className="bg-surface border border-border rounded-2xl shadow-medium overflow-hidden">

        {/* HEADER / HERO */}
        <div className="relative h-44 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">

          {/* PROFILE IMAGE (prominent) */}
          <div className="absolute -bottom-20 left-8">
            <div className="w-36 h-36 rounded-xl border-4 border-surface shadow-medium overflow-hidden bg-surface flex items-center justify-center">
              {developer.profileImage ? (
                <img
                  src={`${uploadsBase}${developer.profileImage}`}
                  alt={developer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary text-white text-4xl font-bold flex items-center justify-center">
                  {initials}
                </div>
              )}
            </div>
          </div>

          {/* ADMIN ACTIONS */}
          {isAdmin && (
            <div className="absolute right-8 bottom-4 flex items-center gap-3">
              <button
                onClick={openEdit}
                title="Edit developer"
                className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg hover:shadow-soft transition"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={deleteDeveloper}
                title="Delete developer"
 y
                className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 border border-red-100 rounded-lg hover:shadow-soft transition"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="pt-24 px-8 pb-8">
          {/* NAME + EMAIL */}
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text">
                {developer.name}
              </h1>
              <p className="text-muted flex items-center gap-2 mt-2">
                <Mail size={14} />
                {developer.email}
              </p>
              {createdAt && (
                <p className="text-sm text-muted mt-1 flex items-center gap-2">
                  <Calendar size={14} />
                  Joined {createdAt}
                </p>
              )}
            </div>

            {/* ROLE BADGE */}
            <div className="flex items-center">
              <span className="px-4 py-1.5 rounded-full bg-primarySoft text-primary text-sm font-medium">
                {developer.role || "Developer"}
              </span>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">

            <StatCard
              icon={<Users size={18} />}
              label="Team"
              value={developer.team?.name || "Unassigned"}
            />

            <StatCard
              icon={<Globe size={18} />}
              label="Namespaces"
              value={namespaces.length}
            />

            <StatCard
              icon={<ShieldCheck size={18} />}
              label="Status"
              value="Active"
              highlight="success"
            />

            <StatCard
              icon={<Calendar size={18} />}
              label="Created"
              value={createdAt || "-"}
            />

          </div>

          {/* NAMESPACES SECTION */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-text mb-4">
              Kubernetes Access
            </h3>

            {namespaces.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {namespaces.map((ns, i) => (
                  <div
                    key={i}
                    className="p-4 border border-border rounded-xl bg-surfaceSoft hover:border-primary/40 hover:shadow-soft transition"
                  >
                    <span className="font-mono text-text">{ns}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted text-sm">
                No namespaces assigned
              </div>
            )}
          </div>

        </div>
      </div>

      {/* EDIT MODAL */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Edit Developer</h2>
                <p className="text-xs text-slate-500 mt-0.5">{developer.name}</p>
              </div>
              <button onClick={() => setEditOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Name</label>
                <input className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg" value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
                <input className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg" type="email" value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Team</label>
                <select className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg" value={editForm.teamId}
                  onChange={e => setEditForm({ ...editForm, teamId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {teams.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={saveEdit} disabled={saving}
                  className="flex-1 py-2.5 text-sm bg-[#E53935] hover:bg-[#C62828] text-white rounded-lg font-medium transition disabled:opacity-50">
                  {saving ? "Saving…" : (<span className="inline-flex items-center gap-2"><Check size={14}/> Save Changes</span>)}
                </button>
                <button onClick={() => setEditOpen(false)}
                  className="flex-1 py-2.5 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <div className="text-center text-sm text-red-600">{error}</div>}
    </div>
  );
}

/* 🔥 REUSABLE STAT CARD */
function StatCard({ icon, label, value, highlight }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-surface hover:shadow-soft transition">
      <div className="flex items-center gap-2 text-muted text-sm mb-1">
        {icon}
        {label}
      </div>
      <div
        className={`text-lg font-semibold ${
          highlight === "success" ? "text-success" : "text-text"
        }`}
      >
        {value}
      </div>
    </div>
  );
}