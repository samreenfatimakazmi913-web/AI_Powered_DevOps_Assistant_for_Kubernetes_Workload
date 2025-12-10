import React from "react";
import { NavLink } from "react-router-dom";

/* Small inline SVG icons */
const Icon = ({ path }) => (
  <svg
    className="w-5 h-5 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path d={path} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Sidebar() {
  const items = [
    { to: "/", label: "Dashboard", icon: "M3 12h18M3 6h18M3 18h18" },
    { to: "/workloads", label: "Workloads", icon: "M3 7h18v10H3z" },
    { to: "/pods", label: "Pods", icon: "M12 2v20M2 12h20" },
    { to: "/deployments", label: "Deployments", icon: "M12 2l9 4.5V21L12 17.5 3 21V6.5L12 2z" },
    { to: "/nodes", label: "Nodes", icon: "M12 2v6M12 16v6M4 8h16" },
    { to: "/assistant", label: "AI Assistant", icon: "M12 2v20M2 12h20" }

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
        <div className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
          K8s Assistant
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
          Cluster overview
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {items.map((it) => (
          <NavLink
            to={it.to}
            end
            key={it.to}
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-3 py-2 rounded-md 
              transition-colors duration-300
              hover:bg-gray-100 dark:hover:bg-gray-800
              ${isActive
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400"
                : "text-gray-900 dark:text-gray-200"
              }
              `
            }
          >
            <Icon path={it.icon} />
            <span className="text-sm font-medium">{it.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
