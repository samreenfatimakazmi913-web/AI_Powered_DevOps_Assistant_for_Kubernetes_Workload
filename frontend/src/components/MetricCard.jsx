import React from "react";

export default function MetricCard({ title, value, delta, color = "k8sBlue" }) {
  return (
    <div className="card p-5 rounded-xl shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted">{title}</div>
          <div className={`text-2xl font-semibold text-${color}`}>{value}</div>
        </div>
        <div className="text-sm text-muted">{delta}</div>
      </div>
    </div>
  );
}
