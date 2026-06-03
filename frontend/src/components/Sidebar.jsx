import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  ListTree,
  Sparkles,
  Bell,
  ShieldCheck,
} from "lucide-react";

import K8ViewerLogo from "./K8ViewerLogo";

function getRole() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.role || null;
  } catch { return null; }
}

export default function Sidebar({ onClose }) {
  const role = getRole();

  const items = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/workloads", label: "Workloads", icon: Layers },
    { to: "/events", label: "Cluster Events", icon: Bell },
    { to: "/structured", label: "Structured Querying", icon: ListTree },
    { to: "/assistant", label: "AI Assistant", icon: Sparkles },
    ...(role === "admin"
      ? [{ to: "/admin", label: "Admin Panel", icon: ShieldCheck }]
      : []),
  ];

  return (
    <aside className="
      w-64 h-full flex flex-col
      bg-sidebar
      border-r border-darkborder
      shadow-strong
    ">

      {/* ── Brand ── */}
      <div className="px-6 py-5 border-b border-darkborder">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="K8Viewer Logo" className="w-8 h-8 shrink-0" />
          <div>
            <div className="text-xl font-bold text-sidebarText leading-tight">
              K8Viewer
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {items.map((it, idx, arr) => {
          const Icon = it.icon;
          const isAdminItem = it.to === "/admin";
          const prevIsNotAdmin = idx > 0 && arr[idx - 1].to !== "/admin";

          return (
            <React.Fragment key={it.to}>
              {isAdminItem && prevIsNotAdmin && (
                <div className="my-2 border-t border-darkborder" />
              )}

              <NavLink
                to={it.to}
                onClick={onClose}
                className={({ isActive }) =>
                   `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                     isActive
                       ? "bg-sidebarActive text-white shadow-medium"
                       : "text-sidebarMuted hover:bg-sidebarHover hover:text-sidebarText"
                   }`
                }
              >
                {({ isActive }) => (
                  <>
                     <Icon
                       size={17}
                       className={`shrink-0 transition-colors ${
                         isActive
                           ? "text-white"
                           : "text-sidebarMuted group-hover:text-sidebarText"
                       }`}
                     />
                    <span>{it.label}</span>
                  </>
                )}
              </NavLink>
            </React.Fragment>
          );
        })}
      </nav>

       {/* ── Footer ── */}
       <div className="px-6 py-4 border-t border-darkborder">
         <p className="text-[11px] text-sidebarMuted">
           © 2026 Kubernetes Assistant
         </p>
       </div>
    </aside>
  );
}