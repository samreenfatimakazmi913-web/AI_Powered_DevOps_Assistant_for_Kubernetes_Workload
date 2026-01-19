// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ListTree,
  Sparkles,
} from "lucide-react";

export default function Sidebar({ onClose }) {
  const items = [
    {
      to: "/dashboard",
      label: "Executive Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/structured",
      label: "Structured Querying",
      icon: ListTree,
    },
    {
      to: "/assistant",
      label: "AI Assistant",
      icon: Sparkles,
    },
  ];

  return (
    <aside
      className="
        w-64 h-full
        p-6
        bg-[#0f0f0f]
        border-r border-gray-800
        flex flex-col
      "
    >
      {/* ================= BRAND ================= */}
      <div className="mb-8">
        <div className="text-2xl font-bold text-white">
          K8s Assistant
        </div>
        <div className="text-sm text-gray-400">
          Cluster overview
        </div>
      </div>

      {/* ================= NAV ================= */}
      <nav className="flex flex-col gap-1">
        {items.map(it => {
          const Icon = it.icon;

          return (
            <NavLink
              key={it.to}
              to={it.to}
              onClick={onClose}
              className={({ isActive }) =>
                `
                group flex items-center gap-3
                px-4 py-2 rounded-md
                text-sm font-medium
                transition-all
                ${
                  isActive
                    ? "bg-[#8B0000] text-white"
                    : "text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
                }
                `
              }
            >
              {/* ICON */}
              <Icon
                size={18}
                className="
                shrink-0
                transition-colors
                text-[#EFCD23]
                group-hover:text-white
                "
/>

              {/* LABEL */}
              <span>{it.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* ================= FOOTER ================= */}
      <div className="mt-auto pt-6 text-xs text-gray-500">
        © Kubernetes Assistant
      </div>
    </aside>
  );
}
