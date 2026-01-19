import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO / TITLE */}
          <div className="flex items-center gap-2 text-white">
            <div className="w-3 h-3 bg-[#8B0000] rounded-sm" />
            <h1 className="text-lg font-semibold tracking-tight">
              DevOps Visual Lab
            </h1>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-10 text-sm">
            <Link
              to="/"
              className="text-white/70 hover:text-white transition"
            >
              Home
            </Link>

            <Link
              to="/about"
              className="text-white/70 hover:text-white transition"
            >
              About
            </Link>

            <Link
              to="/auth"
              className="px-5 py-2 rounded-md bg-[#8B0000] text-white
                         hover:opacity-90 transition"
            >
              Log in
            </Link>
          </nav>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-white text-xl"
          >
            ☰
          </button>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="md:hidden px-6 pb-6 space-y-4 bg-black border-t border-white/10">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="block text-white/70 hover:text-white"
            >
              Home
            </Link>

            <Link
              to="/about"
              onClick={() => setOpen(false)}
              className="block text-white/70 hover:text-white"
            >
              About
            </Link>

            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 rounded-md bg-[#8B0000] text-white text-center"
            >
              Log in
            </Link>
          </div>
        )}
      </header>

      {/* SPACER */}
      <div className="h-[72px]" />
    </>
  );
}
