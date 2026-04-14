// src/components/Topbar.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Menu,
  ChevronDown,
  Camera,
  LogOut,
  KeyRound
} from "lucide-react";

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const [open, setOpen] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const dropdownRef = useRef(null);
  const [showEditAvatar, setShowEditAvatar] = useState(false);

  const initials = user?.name
    ?.split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth");
  };

  const routeTitles = {
    "/dashboard": {
      title: "Executive Dashboard",
      subtitle: "",
    },
    "/workloads": {
      title: "Workloads",
      subtitle: "Deployments, Pods, Jobs, CronJobs, DaemonSets, StatefulSets",
    },
    "/events": {
      title: "Cluster Events",
      subtitle: "Warnings, errors and state changes across your cluster",
    },
    "/logs": {
      title: "Log Viewer",
      subtitle: "Browse and search pod logs with container selection",
    },
    "/structured": {
      title: "Structured Querying",
      subtitle: "Query Kubernetes resources using filters",
    },
    "/assistant": {
      title: "AI Assistant",
      subtitle: "Ask questions about your cluster",
    },
    "/nodes": {
      title: "Nodes Overview",
      subtitle: "Cluster infrastructure status",
    },
    "/admin/teams": {
      title: "Team Details",
      subtitle: "Manage team members and assignments",
    },
    "/admin": {
      title: "Admin Panel",
      subtitle: "",
    },
  };

  const currentRoute =
    Object.keys(routeTitles)
      .sort((a, b) => b.length - a.length)
      .find(r => location.pathname.startsWith(r)) || "/dashboard";

  const { title, subtitle } = routeTitles[currentRoute];

  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {/* ================= TOPBAR ================= */}
      <header className="w-full px-6 py-3.5 flex items-center justify-between bg-sidebar border-b border-darkborder">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition"
          >
            <Menu size={20} className="text-muted" />
          </button>

          <div className="flex flex-col">
           <span className="text-xl font-bold text-sidebarText leading-tight">
             {title}
           </span>
            <span className="text-xs text-sidebarMuted hidden sm:block mt-0.5">
              {subtitle}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="
              flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg
              border border-sidebarActive bg-sidebarActive
              hover:bg-secondaryHover hover:border-secondaryHover
              transition
            "
          >
            {user?.profileImage ? (
              <img
                src={`http://localhost:5000${user.profileImage}`}
                alt="avatar"
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-yellow-400 text-black text-xs font-bold">
                {initials}
              </div>
            )}

            <span className="hidden md:block text-sm font-medium text-white">
              {user?.name}
            </span>

            <ChevronDown size={14} className="text-white" />
          </button>

          {/* DROPDOWN */}
          {open && (
            <div className="
              absolute right-0 mt-2 w-64
              bg-surface border border-border
              rounded-xl shadow-strong
              z-50 overflow-hidden
            ">

              {/* USER INFO */}
              <div className="px-4 py-3.5 bg-sidebarActive border-b border-border flex gap-3 items-center">
                {user?.profileImage ? (
                  <img
                    src={`http://localhost:5000${user.profileImage}`}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white font-bold">
                    {initials}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-text truncate">
                    {user?.name}
                  </div>
                  <div className="text-xs text-muted truncate">
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              {[
                { icon: Camera, label: "Edit Photo", action: () => { setShowEditAvatar(true); setOpen(false); } },
                { icon: KeyRound, label: "Change Password", action: () => { setShowPwdModal(true); setOpen(false); } },
              ].map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="
                    w-full px-4 py-2.5 text-sm flex items-center gap-3
                    text-muted hover:bg-primary/10 hover:text-primary
                    transition text-left
                  "
                >
                  <Icon size={15} className="text-muted" />
                  {label}
                </button>
              ))}

              <div className="border-t border-border" />

              <button
                onClick={handleLogout}
                className="
                  w-full px-4 py-2.5 text-sm flex items-center gap-3
                  text-primary hover:bg-primary/10
                  transition text-left
                "
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ================= MODALS ================= */}
      {showPwdModal && <ChangePasswordModal onClose={() => setShowPwdModal(false)} />}
      {showEditAvatar && <EditAvatarModal onClose={() => setShowEditAvatar(false)} />}
    </>
  );
}

/* ================= MODALS ================= */

function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({
    current: "",
    newPwd: "",
    confirm: "",
  });

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.current || !form.newPwd || !form.confirm) {
      return alert("All fields required");
    }

    if (form.newPwd !== form.confirm) {
      return alert("Passwords do not match");
    }

    const user = JSON.parse(localStorage.getItem("user"));

    const res = await fetch("http://localhost:5000/api/users/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        currentPassword: form.current,
        newPassword: form.newPwd,
      }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    alert("Password updated");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-sm rounded-2xl shadow-strong">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-text font-semibold">Change Password</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          <input className="w-full p-2 border border-border rounded" placeholder="Current password" />
          <input className="w-full p-2 border border-border rounded" placeholder="New password" />
          <input className="w-full p-2 border border-border rounded" placeholder="Confirm password" />

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 border border-border p-2 rounded">
              Cancel
            </button>
            <button className="flex-1 bg-primary text-white p-2 rounded">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditAvatarModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-sm rounded-2xl shadow-strong p-6">
        <p className="text-text">Avatar Upload UI</p>
        <button onClick={onClose} className="mt-4 bg-primary text-white px-4 py-2 rounded">
          Close
        </button>
      </div>
    </div>
  );
}