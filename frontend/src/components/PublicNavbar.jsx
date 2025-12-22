import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider";
import DevOpsVisualLabLogo from "./DevOpsVisualLabLogo";

export default function PublicNavbar() {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? "text-blue-600"
        : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0b111b]/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LEFT — LOGO */}
        <NavLink to="/" className="flex items-center">
          <DevOpsVisualLabLogo />
        </NavLink>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>

          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>

          <NavLink
            to="/auth"
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm
                       hover:bg-blue-700 transition"
          >
            Get Started
          </NavLink>

          <button
            onClick={toggleTheme}
            className="text-sm px-3 py-2 rounded-md border border-gray-300
                       dark:border-gray-700 hover:bg-gray-100
                       dark:hover:bg-gray-800 transition"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </nav>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-700 dark:text-gray-300 text-xl"
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden px-6 pb-6 space-y-4 bg-white dark:bg-[#0b111b]
                        border-t border-gray-200 dark:border-gray-800">
          <NavLink
            to="/"
            end
            onClick={() => setOpen(false)}
            className={linkClass}
          >
            Home
          </NavLink>

          <NavLink
            to="/about"
            onClick={() => setOpen(false)}
            className={linkClass}
          >
            About
          </NavLink>

          <NavLink
            to="/auth"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 rounded-md bg-blue-600
                       text-white text-sm"
          >
            Get Started
          </NavLink>

          <button
            onClick={() => {
              toggleTheme();
              setOpen(false);
            }}
            className="block w-full text-left text-sm px-3 py-2 rounded-md
                       border border-gray-300 dark:border-gray-700
                       dark:text-gray-300"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      )}
    </header>
  );
}
