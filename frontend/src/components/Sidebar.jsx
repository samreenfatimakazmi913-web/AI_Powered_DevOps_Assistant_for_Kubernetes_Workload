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
        bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800
        flex flex-col
      "
    >
      {/* ================= BRAND ================= */}
      <div className="mb-8">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          K8s Assistant
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
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
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                  text-gray-500
                  group-hover:text-gray-700
                  dark:text-gray-400
                  dark:group-hover:text-gray-200
                "
              />

              {/* LABEL */}
              <span>{it.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* ================= FOOTER SPACE ================= */}
      <div className="mt-auto pt-6 text-xs text-gray-400 dark:text-gray-500">
        © Kubernetes Assistant
      </div>
    </aside>
  );
}
