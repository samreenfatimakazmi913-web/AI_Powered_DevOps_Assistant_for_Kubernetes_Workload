import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../theme/ThemeProvider";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme(); // ✅ THIS WAS MISSING

  return (
    <header className="
      flex items-center justify-between p-4
      bg-white dark:bg-slate-900
      shadow-sm border-b border-gray-200 dark:border-gray-800
    ">
      <h1 className="text-lg font-semibold">
        DevOps Assistant
      </h1>

      <button
        onClick={toggleTheme}
        className="
          p-2 rounded-md
          border border-gray-300 dark:border-gray-700
          hover:bg-gray-100 dark:hover:bg-gray-800
          transition
        "
        title="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun size={18} className="text-yellow-500" />
        ) : (
          <Moon size={18} className="text-gray-700 dark:text-gray-300" />
        )}
      </button>
    </header>
  );
}
