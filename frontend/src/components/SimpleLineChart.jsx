import React from "react";

/**
 * props:
 *  - points: [{x:0..1, y:0..1}] normalized
 *  - stroke: optional color (fallback to theme)
 */
export default function SimpleLineChart({ points = [], stroke, height = 80 }) {
  if (!points.length) return <div style={{ height }} />;

  // 👇 fallback to CSS variable (theme)
  const color = stroke || "var(--color-primary)";

  const w = 300, h = height;
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x * w} ${h - p.y * h}`)
    .join(" ");

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="rounded"
    >
      <defs>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* line */}
      <path
        d={path}
        stroke={color}
        strokeWidth="2.2"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* area */}
      <path
        d={`${path} L ${w} ${h} L 0 ${h} Z`}
        fill="url(#grad)"
        opacity="0.8"
      />
    </svg>
  );
}