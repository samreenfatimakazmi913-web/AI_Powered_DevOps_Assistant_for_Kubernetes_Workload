import React from "react";

export default function ResourceFilters({
  namespaces = [],
  pods = [],
  selectedNamespace,
  selectedPod,
  timeRange,
  onNamespaceChange,
  onPodChange,
  onTimeRangeChange,
}) {
  const safeNamespaces = Array.isArray(namespaces) ? namespaces : [];
  const safePods = Array.isArray(pods) ? pods : [];

  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 border rounded-lg p-4">

      <div>
        <label className="text-xs text-gray-500">Namespace</label>
        <select
          value={selectedNamespace}
          onChange={e => onNamespaceChange(e.target.value)}
          className="px-3 py-2 rounded-md border focus:border-[#8B0000] focus:ring-[#8B0000]"
        >
          <option value="all">All</option>
          {safeNamespaces.map(ns => (
            <option key={ns} value={ns}>{ns}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-500">Pod</label>
        <select
          value={selectedPod}
          onChange={e => onPodChange(e.target.value)}
          className="px-3 py-2 rounded-md border focus:border-[#8B0000] focus:ring-[#8B0000]"
        >
          <option value="all">All</option>
          {safePods.map(p => (
            <option key={p.metadata?.name} value={p.metadata?.name}>
              {p.metadata?.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-500">Time</label>
        <select
          value={timeRange}
          onChange={e => onTimeRangeChange(e.target.value)}
          className="px-3 py-2 rounded-md border focus:border-[#8B0000] focus:ring-[#8B0000]"
        >
          <option value="15m">15m</option>
          <option value="1h">1h</option>
          <option value="6h">6h</option>
          <option value="24h">24h</option>
        </select>
      </div>
    </div>
  );
}
