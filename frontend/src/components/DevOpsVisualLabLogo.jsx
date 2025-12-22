import React from "react";

export default function DevOpsVisualLabLogo({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon */}
      <svg
        width="34"
        height="34"
        viewBox="0 0 24 24"
        fill="none"
        className="text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" />
        <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" />
        <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" />
        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1"
          fill="currentColor"
          opacity="0.4"
        />
      </svg>

      {/* Text */}
      <div className="leading-tight">
        <div className="font-extrabold text-lg text-gray-900 dark:text-white">
          DevOps Visual Lab
        </div>
        <div className="text-xs text-gray-500">
          Visual DevOps Learning Platform
        </div>
      </div>
    </div>
  );
}
