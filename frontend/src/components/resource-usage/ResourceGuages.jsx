import React from "react";
import ResourceUsageSection from "../resource-usage/ResourceUsageSection";
import { Cpu, MemoryStick } from "lucide-react";

/**
 * Pure visual component
 * Shows CPU + Memory gauges side-by-side
 */
export default function ResourceGauges({
  cpuUsed,
  cpuTotal,
  memoryUsed,
  memoryTotal,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

      {/* ================= CPU ================= */}
      <ResourceUsageCard
        title={
          <span className="flex items-center gap-2">
            <Cpu size={16} />
            CPU Usage
          </span>
        }
        used={cpuUsed}
        total={cpuTotal}
        unit=" cores"
      />

      {/* ================= MEMORY ================= */}
      <ResourceUsageSection
        title={
          <span className="flex items-center gap-2">
            <MemoryStick size={16} />
            Memory Usage
          </span>
        }
        used={memoryUsed}
        total={memoryTotal}
        unit=" GiB"
      />
    </div>
  );
}




