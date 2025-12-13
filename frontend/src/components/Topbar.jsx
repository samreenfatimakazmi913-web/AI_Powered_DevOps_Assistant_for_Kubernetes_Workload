// ===============================
// src/components/Topbar.jsx
// ===============================
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
      {/* Left */}
      <div className="text-lg font-semibold tracking-wide">
        Executive Dashboard
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="
            px-3 py-2 rounded-md text-sm w-56
            bg-gray-50 text-gray-900 placeholder-gray-500
            border border-gray-300
            focus:outline-none focus:ring-2 focus:ring-blue-500
            dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-400
            dark:border-gray-700
          "
        />

        <button
          onClick={toggleTheme}
          className="px-3 py-2 rounded-md text-sm border
            border-gray-300 hover:bg-gray-100
            dark:border-gray-700 dark:hover:bg-gray-800"
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>

        <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold bg-blue-600 text-white">
          S
        </div>
      </div>
    </header>
  );
}

