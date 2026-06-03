import React from "react";

export default function DocSidebar() {
  const [activeId, setActiveId] = React.useState("intro");

  React.useEffect(() => {
    const handler = (e) => setActiveId(e.detail);
    window.addEventListener("docSectionChange", handler);
    return () => window.removeEventListener("docSectionChange", handler);
  }, []);

  const getItemClass = (id) =>
    `block px-4 py-2 rounded text-sm transition ${
      activeId === id
        ? "bg-[#A82323] text-white font-medium shadow-[0_4px_16px_rgba(168,35,35,0.3)]"
        : "text-white/70 hover:text-white hover:bg-[#A82323]/12"
    }`;

  return (
    <aside className="
      w-64
      bg-black
      text-white
      border-r border-[#A82323]/15
      shadow-[16px_0_40px_rgba(0,0,0,0.18)]
      p-6
      sticky top-0 h-screen overflow-y-auto z-10
    ">
      <h3 className="font-semibold mb-4 text-white">
        Documentation
      </h3>

      <nav className="space-y-2">
        <a href="#intro" className={getItemClass("intro")}>Introduction</a>
        <a href="#kubernetes" className={getItemClass("kubernetes")}>What is Kubernetes?</a>
        <a href="#setup" className={getItemClass("setup")}>Setup & Requirements</a>
        <a href="#login" className={getItemClass("login")}>Login & Access</a>
        <a href="#dashboard" className={getItemClass("dashboard")}>Dashboard Overview</a>
        <a href="#ai" className={getItemClass("ai")}>AI Assistant</a>
        <a href="#security" className={getItemClass("security")}>Security Model</a>
      </nav>
    </aside>
  );
}