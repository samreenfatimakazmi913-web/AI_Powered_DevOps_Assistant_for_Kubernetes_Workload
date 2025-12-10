import React from "react";
import { useTheme } from "../theme/ThemeProvider";

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="
        w-full px-6 py-3 flex items-center justify-between border-b
        bg-white text-gray-900 border-gray-200
        dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800
        transition-colors duration-300
      "
    >
      {/* Left side */}
      <div className="text-lg font-semibold tracking-wide">
        Kubernetes Dashboard
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">

        {/* Search bar */}
        <input
          type="text"
          placeholder="Search…"
          className="
            px-3 py-2 rounded-md text-sm
            bg-gray-50 text-gray-900 placeholder-gray-500
            border border-gray-300 hover:border-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
            dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-400
            dark:border-gray-700 dark:hover:border-gray-600
            dark:focus:border-blue-500 dark:focus:ring-blue-500
            transition-colors duration-200
          "
        />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="
            p-2 rounded-md transition-colors
            hover:bg-gray-200 dark:hover:bg-gray-700
          "
        >
          {theme === "dark" ? "🌞" : "🌙"}
        </button>

        {/* Profile bubble */}
        <div
          className="
            w-9 h-9 rounded-full flex items-center justify-center font-bold
            bg-gray-300 text-gray-900
            dark:bg-blue-600 dark:text-white
            transition-colors duration-200
          "
        >
          S
        </div>
      </div>
    </header>
  );
}
