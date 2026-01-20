import React from "react";

export default function DocSidebar() {
  const linkClass =
    "block px-4 py-2 rounded text-sm transition text-gray-300 hover:text-white";

  const active =
    "bg-[#8B0000] text-white font-medium";

  return (
    <aside className="w-64 bg-black text-white p-6 sticky top-0 h-screen overflow-y-auto">
      <h3 className="font-semibold mb-4">Documentation</h3>

      <nav className="space-y-2">
        <a href="#intro" className={`${linkClass} ${active}`}>Introduction</a>
        <a href="#kubernetes" className={linkClass}>What is Kubernetes?</a>
        <a href="#setup" className={linkClass}>Setup & Requirements</a>
        <a href="#login" className={linkClass}>Login & Access</a>
        <a href="#dashboard" className={linkClass}>Dashboard Overview</a>
        <a href="#ai" className={linkClass}>AI Assistant</a>
        <a href="#security" className={linkClass}>Security Model</a>
      </nav>
    </aside>
  );
}
