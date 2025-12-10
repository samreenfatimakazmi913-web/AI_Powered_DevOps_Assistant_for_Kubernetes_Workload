import React, { useState } from "react";

export function Tabs({ tabs = [], defaultTab = 0 }) {
  const [active, setActive] = useState(defaultTab);

  return (
    <div>
      <div className="flex gap-3 border-b dark:border-gray-700 mb-4">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => setActive(index)}
            className={
              "px-4 py-2 -mb-px font-medium transition " +
              (active === index
                ? "border-b-2 text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400")
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>{tabs[active]?.content}</div>
    </div>
  );
}
