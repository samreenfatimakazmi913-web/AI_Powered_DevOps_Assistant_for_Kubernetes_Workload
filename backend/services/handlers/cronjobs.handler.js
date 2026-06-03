const { getCronJobs, describeCronJob } = require("../kube.service");

function parseNsList(ns) {
  if (!ns || ns === "all") return [];
  return ns.split(",").map(s => s.trim()).filter(Boolean);
}
function nsLabel(nsList) {
  if (!nsList.length) return "across all namespaces";
  if (nsList.length === 1) return `in the ${nsList[0]} namespace`;
  return `across your namespaces (${nsList.join(", ")})`;
}

// ===============================
// CRONJOB HANDLER
// ===============================
async function handleCronJobs(intent) {
  const ns = intent.namespace || "default";

  /* ================= DESCRIBE ================= */
  if (intent.action === "describe") {
    if (!intent.name) {
      return {
        reply: "Please specify the cronjob name.",
        type: "text"
      };
    }

    try {
      const output = await describeCronJob(intent.name, ns);

      return {
        reply: `Details for cronjob ${intent.name}:`,
        type: "logs",
        data: output
      };
    } catch (err) {
      return {
        reply: `CronJob '${intent.name}' not found in ${ns} namespace.`,
        type: "text"
      };
    }
  }

  /* ================= FETCH ================= */
  let cronjobs = [];
  const nsList = parseNsList(ns);

  try {
    if (!nsList.length) {
      cronjobs = await getCronJobs("all");
    } else if (nsList.length === 1) {
      cronjobs = await getCronJobs(nsList[0]);
    } else {
      const results = await Promise.all(nsList.map(n => getCronJobs(n)));
      cronjobs = results.flat();
    }
  } catch (err) {
    console.error("CRONJOB FETCH ERROR:", err);
    return {
      reply: "Failed to fetch cronjobs.",
      type: "text"
    };
  }

  /* ================= ENRICH ================= */
  const enriched = cronjobs.map(c => {
    const suspended = c.suspend === true;

    return {
      name: c.name,
      namespace: c.namespace,
      schedule: c.schedule,
      suspend: suspended,
      active: c.active || 0,
      lastSchedule: c.lastSchedule || "-",
      age: c.age,
      unhealthy: suspended
    };
  });

  /* ================= FILTER ================= */
  let result = enriched;

  if (intent.filter && intent.filter !== "all") {
    switch (intent.filter) {
      case "suspended":
        result = enriched.filter(c => c.suspend === true);
        break;

      case "active":
        result = enriched.filter(c => c.active > 0);
        break;
    }
  }

  /* ================= HEALTH ================= */
  if (intent.action === "health" && !intent.filter) {
    result = enriched.filter(c => c.unhealthy);
  }

  /* ================= COUNT ================= */
  if (intent.output === "count") {
    return {
      reply: `Found ${result.length} cronjob(s) ${nsLabel(nsList)}.`,
      type: "text"
    };
  }

  /* ================= INSIGHTS ================= */
  const suspendedCount = enriched.filter(c => c.suspend).length;

  let reply = `Found ${result.length} cronjob(s) ${nsLabel(nsList)}.\n\n`;

  if (suspendedCount > 0) {
    reply += `⚠️ ${suspendedCount} cronjob(s) are suspended.\n`;
    reply += `This means scheduled jobs are not running.\n\n`;
  } else {
    reply += `All cronjobs are active and scheduled properly ✅\n\n`;
  }

  reply += `💡 You can:\n`;
  reply += `• describe a cronjob\n`;
  reply += `• check related jobs\n`;
  reply += `• verify schedule timing`;

  /* ================= RETURN ================= */
  return {
    reply,
    type: "cronjobs",
    data: result
  };
}

module.exports = { handleCronJobs };