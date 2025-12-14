// ===============================
// src/components/Topbar.jsx
// ===============================
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider";

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/auth");
  };

  return (
    <header
      className="
        w-full px-6 py-3 flex items-center justify-between
        border-b bg-white text-gray-900 border-gray-200
        dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800
        transition-colors duration-300
      "
    >
      {/* LEFT — Title */}
      <div className="flex flex-col">
        <span className="text-lg font-semibold tracking-wide">
          Executive Dashboard
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Kubernetes Workload Overview
        </span>
      </div>

      {/* RIGHT — Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search resources…"
          className="
            px-3 py-2 rounded-md text-sm w-64
            bg-gray-50 text-gray-900 placeholder-gray-500
            border border-gray-300
            focus:outline-none focus:ring-2 focus:ring-blue-500
            dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-400
            dark:border-gray-700
            transition-colors
          "
        />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="
            px-3 py-2 rounded-md text-sm font-medium
            border border-gray-300
            hover:bg-gray-100
            dark:border-gray-700 dark:hover:bg-gray-800
            transition-colors
          "
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center
            font-semibold bg-blue-600 text-white">
            S
          </div>

          <button
            onClick={handleLogout}
            className="
              text-sm font-medium text-red-500
              hover:text-red-600
              transition-colors
            "
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
