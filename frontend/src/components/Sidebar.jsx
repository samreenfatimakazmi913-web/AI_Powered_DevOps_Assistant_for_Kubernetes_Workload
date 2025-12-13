// ===============================
// src/components/Sidebar.jsx
// ===============================
import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const items = [
    { to: "/Dashboard", label: "Executive Dashboard" },
    { to: "/structured", label: "Structured Querying" },
    { to: "/assistant", label: "AI Assistant" },
  ];

  return (
    <aside
      className="
        w-64 min-h-screen p-6 border-r
        bg-white border-gray-200 text-gray-900
        dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200
        transition-colors duration-300
      "
    >
      <div className="mb-8">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          K8s Assistant
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Cluster overview
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end
            className={({ isActive }) =>
              `px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200\n              ${isActive
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`
            }
          >
            {it.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}


