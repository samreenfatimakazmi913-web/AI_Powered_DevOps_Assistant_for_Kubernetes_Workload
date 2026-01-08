// src/components/Topbar.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Menu,
  ChevronDown,
  LogOut,
  KeyRound,
  Search,
  Sun,
  Moon
} from "lucide-react";

import { useTheme } from "../theme/ThemeProvider";

export default function Topbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const [open, setOpen] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const dropdownRef = useRef(null);
  const [showEditAvatar, setShowEditAvatar] = useState(false);


  /* ---------------- HELPERS ---------------- */

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
    subtitle: "Kubernetes Workload Overview",
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
  "/admin": {
    title: "Admin Panel",
    subtitle: "Manage teams, namespaces & developers",
  },
};

const currentRoute =
  Object.keys(routeTitles).find(r =>
    location.pathname.startsWith(r)
  ) || "/dashboard";

const { title, subtitle } = routeTitles[currentRoute];


  /* ---------------- CLOSE DROPDOWN ---------------- */

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
      <header
        className="
          w-full px-4 md:px-6 py-3 flex items-center justify-between
          border-b bg-white dark:bg-gray-900
          border-gray-200 dark:border-gray-800
        "
      >
        {/* -------- LEFT -------- */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu size={20} />
          </button>

          <div className="flex flex-col">
           <span className="text-lg font-semibold">
  {title}
</span>
<span className="text-xs text-gray-500 hidden sm:block">
  {subtitle}
</span>

          </div>
        </div>

        {/* -------- RIGHT -------- */}
        <div className="flex items-center gap-3 md:gap-4 relative">
          {/* Search */}
          
<div className="relative hidden sm:block">
  <Search
    size={16}
    className="absolute left-3 top-1/2 -translate-y-1/2
      text-gray-400"
  />

  <input
    type="text"
    placeholder="Search…"
    className="
      pl-9 pr-3 py-2
      rounded-md text-sm w-48 md:w-64
      bg-gray-50 dark:bg-gray-800
      border border-gray-300 dark:border-gray-700
      focus:outline-none focus:ring-2 focus:ring-blue-500
    "
  />
</div>


          {/* Theme */}
          {/* THEME TOGGLE WITH ICON */}
<button
  onClick={toggleTheme}
  className="
    p-2 rounded-md
    border border-gray-300 dark:border-gray-700
    hover:bg-gray-100 dark:hover:bg-gray-800
    transition
  "
  title="Toggle theme"
>
  {theme === "dark" ? (
    <Sun size={18} className="text-yellow-500" />
  ) : (
    <Moon size={18} className="text-gray-700" />
  )}
</button>


          {/* -------- PROFILE -------- */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-2 px-2 py-1 rounded-md
                hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {/* PROFILE AVATAR — NO UPLOAD HERE */}
{user?.profileImage ? (
  <img
    src={`http://localhost:5000${user.profileImage}`}
    alt="avatar"
    className="w-9 h-9 rounded-full object-cover"
  />
) : (
  <div
    className="
      w-9 h-9 rounded-full
      flex items-center justify-center
      text-sm font-bold
      bg-blue-600 text-white
    "
  >
    {initials}
  </div>
)}



              <span className="hidden md:block text-sm font-medium">
                {user?.name}
              </span>

              <ChevronDown size={16} />
            </button>

            {/* -------- DROPDOWN -------- */}
            {open && (
              <div className="
                absolute right-0 mt-2 w-60
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-lg shadow-lg z-50
              ">
                {/* USER INFO */}
                <div className="px-4 py-3 border-b dark:border-gray-800 flex gap-3">
  {/* PROFILE IMAGE */}
  {user?.profileImage ? (
    <img
      src={`http://localhost:5000${user.profileImage}`}
      alt="profile"
      className="w-12 h-12 rounded-full object-cover"
    />
  ) : (
    <div className="
      w-12 h-12 rounded-full
      flex items-center justify-center
      bg-blue-600 text-white
      font-bold
    ">
      {initials}
    </div>
  )}

  {/* USER DETAILS */}
  <div className="flex-1">
    <div className="font-semibold text-sm">{user?.name}</div>
    <div className="text-xs text-gray-500">{user?.email}</div>

    <button
      onClick={() => setShowEditAvatar(true)}
      className="mt-1 text-xs text-blue-600 hover:underline"
    >
      Edit photo
    </button>
  </div>
</div>


                {/* ACTIONS */}
                <button
                  onClick={() => {
                    setShowPwdModal(true);
                    setOpen(false);
                  }}
                  className="w-full px-4 py-2 text-sm flex gap-2
                    hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <KeyRound size={16} />
                  Change Password
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-sm flex gap-2
                    text-red-500 hover:bg-red-50
                    dark:hover:bg-red-900/20"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= CHANGE PASSWORD MODAL ================= */}
      {showPwdModal && (
        <ChangePasswordModal onClose={() => setShowPwdModal(false)} />
      )}

      {showEditAvatar && (
  <EditAvatarModal
    onClose={() => setShowEditAvatar(false)}
  />
)}

    </>
  );
}

/* ================= MODAL COMPONENT ================= */

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

  try {
    const user = JSON.parse(localStorage.getItem("user"));

    const res = await fetch(
      "http://localhost:5000/api/users/change-password",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: form.current,
          newPassword: form.newPwd,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return alert(data.message || "Failed to update password");
    }

    alert("Password updated successfully");
    onClose();
  } catch (err) {
    alert("Server error");
  }
};

  return (
    <div className="
      fixed inset-0 z-50
      bg-black/40
      flex items-center justify-center
    ">
      <div className="
        bg-white dark:bg-gray-900
        w-full max-w-sm rounded-lg p-6
        shadow-xl
      ">
        <h2 className="text-lg font-semibold mb-4">
          Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            placeholder="Current password"
            className="w-full px-3 py-2 border rounded-md
              dark:bg-gray-800 dark:border-gray-700"
            value={form.current}
            onChange={e => setForm({ ...form, current: e.target.value })}
          />

          <input
            type="password"
            placeholder="New password"
            className="w-full px-3 py-2 border rounded-md
              dark:bg-gray-800 dark:border-gray-700"
            value={form.newPwd}
            onChange={e => setForm({ ...form, newPwd: e.target.value })}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full px-3 py-2 border rounded-md
              dark:bg-gray-800 dark:border-gray-700"
            value={form.confirm}
            onChange={e => setForm({ ...form, confirm: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md
                border dark:border-gray-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-md
                bg-blue-600 text-white"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


function EditAvatarModal({ onClose }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleDelete = async () => {
    const res = await fetch(
      `http://localhost:5000/api/users/delete-avatar/${user.id}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      user.profileImage = "";
      localStorage.setItem("user", JSON.stringify(user));
      window.location.reload();
    } else {
      alert("Failed to delete image");
    }
  };

  const handleUpload = async file => {
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("userId", user.id);

    const res = await fetch(
      "http://localhost:5000/api/users/upload-avatar",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (res.ok) {
      user.profileImage = data.image;
      localStorage.setItem("user", JSON.stringify(user));
      window.location.reload();
    } else {
      alert("Upload failed");
    }
  };

  return (
    <div className="
      fixed inset-0 z-50
      bg-black/40
      flex items-center justify-center
    ">
      <div className="
        bg-white dark:bg-gray-900
        w-full max-w-sm rounded-lg p-6
        shadow-xl
      ">
        {/* TITLE */}
        <h2 className="text-lg font-semibold text-center mb-4">
          Edit Profile Photo
        </h2>

        {/* PROFILE PREVIEW */}
        <div className="flex justify-center mb-4">
          {user?.profileImage ? (
            <img
              src={`http://localhost:5000${user.profileImage}`}
              alt="profile"
              className="w-28 h-28 rounded-full object-cover"
            />
          ) : (
            <div className="
              w-28 h-28 rounded-full
              flex items-center justify-center
              text-2xl font-bold
              bg-blue-600 text-white
            ">
              {user?.name
                ?.split(" ")
                .map(w => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="space-y-3">
          {/* UPLOAD */}
          <label className="
            block w-full text-center
            px-4 py-2 border rounded-md
            cursor-pointer
            hover:bg-gray-50
            dark:hover:bg-gray-800
          ">
            Upload new photo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={e => {
                if (e.target.files[0]) {
                  handleUpload(e.target.files[0]);
                }
              }}
            />
          </label>

          {/* DELETE */}
          {user?.profileImage && (
            <button
              onClick={handleDelete}
              className="
                w-full px-4 py-2 rounded-md
                text-red-600 border border-red-300
                hover:bg-red-50
                dark:hover:bg-red-900/20
              "
            >
              Delete photo
            </button>
          )}

          {/* CANCEL */}
          <button
            onClick={onClose}
            className="
              w-full px-4 py-2 rounded-md
              border dark:border-gray-700
            "
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
