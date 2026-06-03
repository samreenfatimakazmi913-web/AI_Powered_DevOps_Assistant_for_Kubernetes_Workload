import React, { useState } from "react";

export function Tabs({ tabs = [], defaultTab = 0 }) {
  const [active, setActive] = useState(defaultTab);

  return (
    <div>
      {/* TAB HEADERS */}
      <div className="flex gap-3 border-b border-border mb-4">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => setActive(index)}
            className={
              "px-4 py-2 -mb-px font-medium transition " +
              (active === index
                ? "border-b-2 border-primary text-primary"
                : "text-muted hover:text-primary")
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="text-text">
        {tabs[active]?.content}
      </div>
    </div>
  );
}