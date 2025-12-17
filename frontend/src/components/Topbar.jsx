// src/components/Topbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useTheme } from "../theme/ThemeProvider";

export default function Topbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/auth");
  };

  return (
    <header className="
      w-full px-4 md:px-6 py-3 flex items-center justify-between
      border-b bg-white dark:bg-gray-900
      border-gray-200 dark:border-gray-800
    ">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col">
          <span className="text-lg font-semibold">Executive Dashboard</span>
          <span className="text-xs text-gray-500 hidden sm:block">
            Kubernetes Workload Overview
          </span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search (hide on small mobile) */}
        <input
          type="text"
          placeholder="Search…"
          className="
            hidden sm:block
            px-3 py-2 rounded-md text-sm w-48 md:w-64
            bg-gray-50 dark:bg-gray-800
            border border-gray-300 dark:border-gray-700
          "
        />

        <button
          onClick={toggleTheme}
          className="px-3 py-2 rounded-md text-sm border
            border-gray-300 dark:border-gray-700"
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>

        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
