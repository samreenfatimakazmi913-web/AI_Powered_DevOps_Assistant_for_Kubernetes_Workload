import React from "react";
import { Sun, Moon } from "lucide-react";

export default function Navbar({ dark, setDark }) {
  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 shadow-sm border-b">
      <h1 className="text-lg font-semibold">DevOps Assistant</h1>

      <button
        onClick={() => setDark(!dark)}
        className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
