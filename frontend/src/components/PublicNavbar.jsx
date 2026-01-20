import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import DevOpsVisualLabLogo from "./DevOpsVisualLabLogo";

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `relative text-sm transition-all ${
      isActive
        ? "text-white font-semibold after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-[2px] after:bg-[#8B0000]"
        : "text-white/70 hover:text-white"
    }`;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <NavLink to="/" className="flex items-center">
          <DevOpsVisualLabLogo />
        </NavLink>

        <nav className="hidden md:flex items-center gap-10">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/docs" className={linkClass}>Documentation</NavLink>
          <NavLink
            to="/auth"
            className="px-5 py-2 rounded-md bg-[#8B0000] text-white text-sm hover:opacity-90 transition"
          >
            Log in
          </NavLink>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white text-xl"
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="md:hidden px-6 pb-6 space-y-4 bg-black border-t border-white/10">
          <NavLink to="/" end onClick={() => setOpen(false)} className={linkClass}>Home</NavLink>
          <NavLink to="/docs" onClick={() => setOpen(false)} className={linkClass}>Documentation</NavLink>
          <NavLink
            to="/auth"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 rounded-md bg-[#8B0000] text-white text-sm text-center"
          >
            Log in
          </NavLink>
        </div>
      )}
    </header>
  );
}
