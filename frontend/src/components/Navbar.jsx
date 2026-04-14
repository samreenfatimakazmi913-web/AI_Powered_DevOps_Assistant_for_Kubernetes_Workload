import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* NAVBAR */}
      <header
        className="
          fixed top-0 left-0 w-full z-50
          bg-surface/80 backdrop-blur-md
          border-b border-border
        "
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO / TITLE */}
          <div className="flex items-center gap-2 text-text">
            <div className="w-3 h-3 bg-primary rounded-sm" />
            <h1 className="text-lg font-semibold tracking-tight">
              DevOps Visual Lab
            </h1>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-10 text-sm">

            <Link
              to="/"
              className="text-muted hover:text-primary transition"
            >
              Home
            </Link>

            <Link
              to="/about"
              className="text-muted hover:text-primary transition"
            >
              About
            </Link>

            <Link
              to="/auth"
              className="
                px-5 py-2 rounded-md
                bg-primary text-white
                hover:bg-primaryHover
                shadow-soft hover:shadow-medium
                transition
              "
            >
              Log in
            </Link>

          </nav>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-text text-xl"
          >
            ☰
          </button>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div
            className="
              md:hidden px-6 pb-6
              bg-surface/95 backdrop-blur-md
              border-t border-border
            "
          >
            <div className="flex flex-col gap-3 pt-4">

              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="text-muted hover:text-primary transition"
              >
                Home
              </Link>

              <Link
                to="/about"
                onClick={() => setOpen(false)}
                className="text-muted hover:text-primary transition"
              >
                About
              </Link>

              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="
                  mt-2 px-4 py-2 rounded-md
                  bg-primary text-white text-center
                  hover:bg-primaryHover
                  transition
                "
              >
                Log in
              </Link>

            </div>
          </div>
        )}
      </header>

      {/* SPACER */}
      <div className="h-[72px]" />
    </>
  );
}

