// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar({ onClose }) {
  const items = [
    { to: "/dashboard", label: "Executive Dashboard" },
    { to: "/structured", label: "Structured Querying" },
    { to: "/assistant", label: "AI Assistant" },
  ];

  return (
    <aside className="
      w-64 min-h-screen p-6
      bg-white dark:bg-gray-900
      border-r border-gray-200 dark:border-gray-800
    ">
      <div className="mb-8">
        <div className="text-2xl font-bold">K8s Assistant</div>
        <div className="text-sm text-gray-500">Cluster overview</div>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map(it => (
          <NavLink
            key={it.to}
            to={it.to}
            onClick={onClose}
            className={({ isActive }) =>
              `px-4 py-2 rounded-md text-sm font-medium transition
              ${isActive
                ? "bg-blue-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`
            }
          >
            {it.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
