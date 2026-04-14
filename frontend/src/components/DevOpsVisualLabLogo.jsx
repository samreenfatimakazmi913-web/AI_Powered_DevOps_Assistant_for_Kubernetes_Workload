import React from "react";

export default function DevOpsVisualLabLogo({
  className = "",
  variant = "light",
}) {
  const isDark = variant === "dark";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* LOGO MARK */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left stroke (PRIMARY COLOR) */}
        <path
          d="M10 12 L28 52 H40 L22 12 Z"
          fill="var(--color-primary)"
        />

        {/* Right stroke (TEXT COLOR) */}
        <path
          d="M36 12 L54 12 L40 52 H22 Z"
          fill={isDark ? "#F6EFD2" : "var(--color-text)"}
        />
      </svg>

      {/* BRAND NAME */}
      <div
        className={`font-extrabold text-lg tracking-wide ${
          isDark ? "text-[#F6EFD2]" : "text-text"
        }`}
      >
        VIEWER
      </div>
    </div>
  );
}