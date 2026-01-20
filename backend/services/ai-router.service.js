const {
  getPods,
  getPodMetrics,
  getPodLogs,
  getPodEvents
} = require("./kube.service");

/* Normalize action */
function normalizeAction(action) {
  if (!action) return null;
  const a = action.toUpperCase();

  if (a.includes("CPU") || a.includes("MEMORY") || a.includes("METRIC"))
    return "GET_METRICS";
  if (a.includes("LOG")) return "GET_POD_LOGS";
  if (a.includes("EVENT")) return "GET_POD_EVENTS";
  if (a.includes("POD")) return "GET_PODS";

  return action;
}

async function executeAction(intent) {
  intent.action = normalizeAction(intent.action);
  const ns = intent.namespace || "ai-demo";

  switch (intent.action) {

    /* ================= PODS (PROPER TABLE) ================= */
    case "GET_PODS": {
      const pods = await getPods(ns);

      // Column widths (fixed)
      const NAME_W = 32;
      const READY_W = 7;
      const STATUS_W = 12;
      const RESTART_W = 10;
      const AGE_W = 6;

      let out = "";
      out +=
        "NAME".padEnd(NAME_W) +
        "READY".padEnd(READY_W) +
        "STATUS".padEnd(STATUS_W) +
        "RESTARTS".padEnd(RESTART_W) +
        "AGE\n";

      pods.forEach(p => {
        const ready = p.status === "Running" ? "1/1" : "0/1";

        out +=
          p.name.padEnd(NAME_W) +
          ready.padEnd(READY_W) +
          p.status.padEnd(STATUS_W) +
          String(p.restarts).padEnd(RESTART_W) +
          `${p.age}h\n`;
      });

      return out;
    }

    /* ================= METRICS ================= */
    case "GET_METRICS": {
      const metrics = await getPodMetrics(ns);

      let out = "";
      out +=
        "NAME".padEnd(32) +
        "CPU".padEnd(8) +
        "MEMORY\n";

      metrics.forEach(m => {
        out +=
          m.name.padEnd(32) +
          m.cpu.padEnd(8) +
          m.memory + "\n";
      });

      return out;
    }

    /* ================= LOGS ================= */
    case "GET_POD_LOGS": {
      if (!intent.resource) return "Please specify pod name.";
      return await getPodLogs(intent.resource, ns);
    }

    /* ================= EVENTS ================= */
    case "GET_POD_EVENTS": {
      if (!intent.resource) return "Please specify pod name.";
      return await getPodEvents(intent.resource, ns);
    }

    default:
      return "Action not supported.";
  }
}

module.exports = { executeAction };
