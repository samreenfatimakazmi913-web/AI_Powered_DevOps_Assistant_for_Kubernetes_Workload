import React from "react";

export default function MetricCard({
  title,
  value,
  delta,
  color = "primary",
}) {
  const colorMap = {
    primary: "text-primary",
    accent: "text-accent",
    muted: "text-muted",
    success: "text-green-500",
    warning: "text-yellow-500",
    danger: "text-red-500",
    k8sBlue: "text-k8sBlue",
  };

  return (
    <div className="
      rounded-xl border border-border
      bg-surface
      p-5
      shadow-soft
      transition hover:shadow-medium
    ">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted">{title}</div>

          <div className={`text-2xl font-semibold ${colorMap[color]}`}>
            {value}
          </div>
        </div>

        <div className="text-sm text-muted">
          {delta}
        </div>
      </div>
    </div>
  );
}