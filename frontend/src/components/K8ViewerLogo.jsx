import React from "react";

/**
 * K8Viewer Official Logo Component
 * Designed with project brand colors from tailwind.config.js
 * Supports light/dark variants, responsive sizing
 */
export default function K8ViewerLogo({
  className = "",
  variant = "light",
  showText = true,
  size = 36,
}) {
  const isDark = variant === "dark";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* K8Viewer Logo Mark - Kubernetes Hexagon Style */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Hexagon Container */}
        <path
          d="M32 4L58 19V45L32 60L6 45V19L32 4Z"
          fill={isDark ? "#221A5E" : "#FFFFFF"}
          stroke={isDark ? "#85C79A" : "#281C59"}
          strokeWidth="2"
        />

        {/* Inner K8 Schematic Wheel */}
        <circle
          cx="32"
          cy="32"
          r="18"
          fill="none"
          stroke={isDark ? "#4E8D9C" : "#281C59"}
          strokeWidth="2.5"
          opacity="0.85"
        />

        {/* Center Node */}
        <circle
          cx="32"
          cy="32"
          r="5"
          fill={isDark ? "#85C79A" : "#4E8D9C"}
        />

        {/* Pod Nodes around center */}
        <circle cx="32" cy="14" r="3.5" fill="#4E8D9C" />
        <circle cx="48" cy="25" r="3.5" fill="#4E8D9C" />
        <circle cx="48" cy="39" r="3.5" fill="#85C79A" />
        <circle cx="32" cy="50" r="3.5" fill="#85C79A" />
        <circle cx="16" cy="39" r="3.5" fill="#281C59" />
        <circle cx="16" cy="25" r="3.5" fill="#281C59" />

        {/* Connection Lines */}
        <path
          d="M32 32 L32 14 M32 32 L48 25 M32 32 L48 39 M32 32 L32 50 M32 32 L16 39 M32 32 L16 25"
          stroke={isDark ? "#A5B4FC" : "#6B7280"}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Viewer Eye Indicator */}
        <ellipse
          cx="32"
          cy="32"
          rx="8"
          ry="5"
          fill="none"
          stroke={isDark ? "#E0E7FF" : "#281C59"}
          strokeWidth="1.5"
        />
        <circle
          cx="32"
          cy="32"
          r="2.5"
          fill={isDark ? "#85C79A" : "#281C59"}
        />
      </svg>

      {/* Brand Name Text */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className={`font-extrabold text-xl tracking-tight ${
              isDark ? "text-darktext" : "text-text"
            }`}
          >
            K8<span className="text-secondary">Viewer</span>
          </span>
          <span
            className={`text-xs font-medium tracking-wider ${
              isDark ? "text-darkmuted" : "text-muted"
            }`}
          >
            KUBERNETES MONITORING
          </span>
        </div>
      )}
    </div>
  );
}