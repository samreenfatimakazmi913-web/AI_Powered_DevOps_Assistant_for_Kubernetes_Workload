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
      <header className="w-full px-6 py-4 flex items-center justify-between bg-black">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-md hover:bg-white/10"
          >
            <Menu size={20} className="text-white" />
          </button>

          <div className="flex flex-col">
            <span className="text-lg font-semibold text-white">
              {title}
            </span>
            <span className="text-xs text-gray-400 hidden sm:block">
              {subtitle}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div ref={dropdownRef} className="relative">
          {/* ACCOUNT BUTTON */}
          <button
            onClick={() => setOpen(o => !o)}
            className="
              flex items-center gap-3
              px-3 py-1.5 rounded-full
              bg-[#8B0000] hover:bg-[#a00000]
              transition
            "
          >
            {/* AVATAR */}
            {user?.profileImage ? (
              <img
                src={`http://localhost:5000${user.profileImage}`}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover bg-[#EFCD23]"
              />
            ) : (
              <div className="
                w-9 h-9 rounded-full
                flex items-center justify-center
                bg-[#EFCD23] text-black
                font-bold
              ">
                {initials}
              </div>
            )}

            {/* NAME */}
            <span className="hidden md:block text-sm font-medium text-white">
              {user?.name}
            </span>

            <ChevronDown size={16} className="text-white/80" />
          </button>

          {/* ================= DROPDOWN ================= */}
          {open && (
            <div className="
              absolute right-0 mt-3 w-64
              bg-white
              border border-gray-200
              rounded-xl shadow-xl
              z-50
            ">
              {/* USER INFO */}
              <div className="px-4 py-3 border-b border-gray-200 flex gap-3">
                {user?.profileImage ? (
                  <img
                    src={`http://localhost:5000${user.profileImage}`}
                    alt="profile"
                    className="w-12 h-12 rounded-full object-cover bg-[#EFCD23]"
                  />
                ) : (
                  <div className="
                    w-12 h-12 rounded-full
                    flex items-center justify-center
                    bg-[#EFCD23] text-black
                    font-bold
                  ">
                    {initials}
                  </div>
                )}

                <div className="flex-1">
                  <div className="font-semibold text-sm text-black">
                    {user?.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <button
                onClick={() => {
                  setShowEditAvatar(true);
                  setOpen(false);
                }}
                className="
                w-full px-4 py-2 text-sm flex gap-2
                  text-gray-700 bg-white
                  border-none
                  hover:bg-[#8B0000] hover:text-white
                  hover:[&>svg]:text-white
                  transition
                "
            >
            <Camera size={16} className="text-red-600" />
            Edit Photo
           </button>
              <button
                onClick={() => {
                  setShowPwdModal(true);
                  setOpen(false);
                }}
                className="
                  w-full px-4 py-2 text-sm flex gap-2
                  text-gray-700 bg-white
                  border-none
                  hover:bg-[#8B0000] hover:text-white
                  hover:[&>svg]:text-white
                  transition
                "
              >
                <KeyRound size={16} className="text-red-600" />
                Change Password
              </button>

              <button
                onClick={handleLogout}
                className="
                  w-full px-4 py-2 text-sm flex gap-2
                  text-gray-700 bg-white
                  border-none
                  hover:bg-[#8B0000] hover:text-white
                  hover:[&>svg]:text-white
                  transition
                "
              >
                <LogOut size={16} className="text-red-600" />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ================= CHANGE PASSWORD MODAL ================= */}
      {showPwdModal && (
        <ChangePasswordModal onClose={() => setShowPwdModal(false)} />
      )}

      {/* ================= EDIT AVATAR MODAL ================= */}
      {showEditAvatar && (
        <EditAvatarModal onClose={() => setShowEditAvatar(false)} />
      )}
    </>
  );
}

/* ================= MODALS (ORIGINAL LOGIC PRESERVED) ================= */

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
      if (!res.ok) return alert(data.message || "Failed to update password");

      alert("Password updated successfully");
      onClose();
    } catch {
      alert("Server error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full px-3 py-2 border rounded-md" placeholder="Current password" />
          <input className="w-full px-3 py-2 border rounded-md" placeholder="New password" />
          <input className="w-full px-3 py-2 border rounded-md" placeholder="Confirm new password" />

          <div className="flex justify-end gap-2 pt-3">
            <button onClick={onClose} type="button" className="px-4 py-2 border rounded-md">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-[#8B0000] text-white rounded-md">
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

  const handleUpload = async file => {
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("userId", user.id);

    const res = await fetch("http://localhost:5000/api/users/upload-avatar", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      user.profileImage = data.image;
      localStorage.setItem("user", JSON.stringify(user));
      window.location.reload();
    } else alert("Upload failed");
  };

  const handleDelete = async () => {
    const res = await fetch(`http://localhost:5000/api/users/delete-avatar/${user.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      user.profileImage = "";
      localStorage.setItem("user", JSON.stringify(user));
      window.location.reload();
    } else alert("Failed to delete image");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-center mb-4">Edit Profile Photo</h2>

        <div className="flex justify-center mb-4">
          {user?.profileImage ? (
            <img src={`http://localhost:5000${user.profileImage}`} className="w-28 h-28 rounded-full object-cover" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-[#EFCD23] text-black flex items-center justify-center text-2xl font-bold">
              {user?.name?.[0]}
            </div>
          )}
        </div>

        <label className="block w-full text-center px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50">
          Upload new photo
          <input type="file" hidden accept="image/*" onChange={e => handleUpload(e.target.files[0])} />
        </label>

        {user?.profileImage && (
          <button onClick={handleDelete} className="w-full mt-2 px-4 py-2 text-red-600 border rounded-md">
            Delete photo
          </button>
        )}

        <button onClick={onClose} className="w-full mt-3 px-4 py-2 border rounded-md">
          Cancel
        </button>
      </div>
    </div>
  );
}
