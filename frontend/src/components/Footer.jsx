// src/components/Footer.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      className="
        bg-gray-50 dark:bg-[#0f172a]
        border-t border-gray-200 dark:border-gray-800
        text-gray-600 dark:text-gray-400
      "
    >
      <div className="max-w-7xl mx-auto px-6 py-14">

        {/* ================= TOP GRID ================= */}
        <div className="grid gap-10 md:grid-cols-4">

          {/* BRAND */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              DevOps Visual Lab
            </h3>
            <p className="text-sm leading-relaxed">
              AI-powered DevOps assistant for monitoring,
              understanding, and managing Kubernetes workloads
              through visual dashboards and intelligent insights.
            </p>
          </div>

          {/* PRODUCT */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li><NavLink to="/dashboard" className="hover:text-blue-600 transition">Dashboard</NavLink></li>
              <li><NavLink to="/structured" className="hover:text-blue-600 transition">Structured Querying</NavLink></li>
              <li><NavLink to="/assistant" className="hover:text-blue-600 transition">AI Assistant</NavLink></li>
            </ul>
          </div>

          {/* USE CASES */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">
              Use Cases
            </h4>
            <ul className="space-y-2 text-sm">
              <li>DevOps Learning</li>
              <li>Kubernetes Observability</li>
              <li>University Labs</li>
              <li>Academic Demonstrations</li>
            </ul>
          </div>

          {/* PROJECT */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">
              Project
            </h4>
            <ul className="space-y-2 text-sm">
              <li><NavLink to="/about" className="hover:text-blue-600 transition">About</NavLink></li>
              <li>Architecture</li>
              <li>Future Scope</li>
              <li>Documentation</li>
            </ul>
          </div>
        </div>

        {/* ================= DIVIDER ================= */}
        <div className="my-10 border-t border-gray-200 dark:border-gray-800" />

        {/* ================= BOTTOM BAR ================= */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>
            © 2025 <span className="font-medium text-gray-900 dark:text-gray-200">
              DevOps Visual Lab
            </span>
          </p>

          <p className="text-gray-500 dark:text-gray-500">
            Academic project • Inspired by real-world DevOps practices
          </p>
        </div>
      </div>
    </footer>
  );
}
