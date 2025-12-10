import React from "react";

/**
 * props:
 *  - points: [{x:0..1, y:0..1}] normalized
 *  - stroke: color
 */
export default function SimpleLineChart({ points = [], stroke = "#326CE5", height = 80 }) {
  if (!points.length) return <div style={{height}} />;

  const w = 300, h = height;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x * w} ${h - p.y * h}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="rounded">
      <defs>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.15" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={path} stroke={stroke} strokeWidth="2.2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {/* area fill */}
      <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="url(#grad)" opacity="0.8" />
    </svg>
  );
}
