
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import DevOpsVisualLabLogo from "./DevOpsVisualLabLogo";

export default function PublicNavbar({ variant = "light" }) {
  const [open, setOpen] = useState(false);
  const isDark = variant === "dark";

  const linkClass = ({ isActive }) =>
    `relative text-sm transition-all ${
      isActive
        ? "text-primary font-semibold after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-[2px] after:bg-primary"
        : isDark
          ? "text-white/80 hover:text-white"
          : "text-slate-600 hover:text-primary"
    }`;

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md">

      {/* NAVBAR */}
      <div
        className={`border-b transition-shadow ${
          isDark
            ? "bg-black/90 border-white/10"
            : "bg-white/80 backdrop-blur-md border-border"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO */}
          <NavLink to="/" className="flex items-center">
            <DevOpsVisualLabLogo variant={variant} />
          </NavLink>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-10">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>

            <NavLink to="/docs" className={linkClass}>
              Documentation
            </NavLink>

            <NavLink
              to="/auth"
              className="
                px-5 py-2 rounded-md
                bg-primary text-white text-sm
                hover:bg-primary/90
                shadow-sm hover:shadow-md
                transition
              "
            >
              Log in
            </NavLink>
          </nav>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className={`md:hidden text-xl ${
              isDark ? "text-white" : "text-slate-700"
            }`}
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden px-6 pb-6">

          <div
            className={`rounded-b-2xl border-t px-4 pt-4 pb-4 ${
              isDark
                ? "bg-black border-white/10"
                : "bg-white/90 backdrop-blur-md border-border"
            }`}
          >

            <div className="flex flex-col gap-3">

              <NavLink
                to="/"
                end
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                Home
              </NavLink>

              <NavLink
                to="/docs"
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                Documentation
              </NavLink>

              <NavLink
                to="/auth"
                onClick={() => setOpen(false)}
                className="
                  mt-2 px-4 py-2 rounded-md
                  bg-primary text-white text-sm text-center
                  hover:bg-primary/90
                "
              >
                Log in
              </NavLink>

            </div>
          </div>
        </div>
      )}
    </header>
  );
}

