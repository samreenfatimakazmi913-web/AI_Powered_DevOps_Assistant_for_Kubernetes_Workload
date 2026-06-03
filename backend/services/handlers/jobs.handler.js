const { getJobs, describeJob } = require("../kube.service");

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
// JOB HANDLER
// ===============================
async function handleJobs(intent) {
  const ns = intent.namespace || "default";

  /* ================= DESCRIBE ================= */
  if (intent.action === "describe") {
    if (!intent.name) {
      return {
        reply: "Please specify the job name.",
        type: "text"
      };
    }

    try {
      const output = await describeJob(intent.name, ns);

      return {
        reply: `Details for job ${intent.name}:`,
        type: "logs",
        data: output
      };
    } catch (err) {
      return {
        reply: `Job '${intent.name}' not found in ${ns} namespace.`,
        type: "text"
      };
    }
  }

  /* ================= FETCH ================= */
  let jobs = [];
  const nsList = parseNsList(ns);

  try {
    if (!nsList.length) {
      jobs = await getJobs("all");
    } else if (nsList.length === 1) {
      jobs = await getJobs(nsList[0]);
    } else {
      const results = await Promise.all(nsList.map(n => getJobs(n)));
      jobs = results.flat();
    }
  } catch (err) {
    console.error("JOB FETCH ERROR:", err);
    return {
      reply: "Failed to fetch jobs.",
      type: "text"
    };
  }

  /* ================= ENRICH ================= */
  const enriched = jobs.map(j => {
    let status = "Running";

    if (j.succeeded > 0) status = "Completed";
    if (j.failed > 0) status = "Failed";

    const unhealthy = status === "Failed";

    return {
      name: j.name,
      namespace: j.namespace,
      completions: j.completions,
      succeeded: j.succeeded,
      failed: j.failed,
      status,
      age: j.age,
      unhealthy
    };
  });

  /* ================= FILTER ================= */
  let result = enriched;

  if (intent.filter && intent.filter !== "all") {
    switch (intent.filter) {
      case "successful":
        result = enriched.filter(j => j.status === "Completed");
        break;

      case "failed":
        result = enriched.filter(j => j.status === "Failed");
        break;

      case "running":
        result = enriched.filter(j => j.status === "Running");
        break;
    }
  }

  /* ================= HEALTH ================= */
  if (intent.action === "health" && !intent.filter) {
    result = enriched.filter(j => j.unhealthy);
  }

  /* ================= COUNT ================= */
  if (intent.output === "count") {
    return {
      reply: `Found ${result.length} job(s) ${nsLabel(nsList)}.`,
      type: "text"
    };
  }

  /* ================= INSIGHTS ================= */
  const failedCount = enriched.filter(j => j.status === "Failed").length;

  let reply = `Found ${result.length} job(s) ${nsLabel(nsList)}.\n\n`;

  if (failedCount > 0) {
    reply += `⚠️ ${failedCount} job(s) have failed.\n`;
    reply += `Possible reasons:\n`;
    reply += `• container errors\n`;
    reply += `• resource limits\n`;
    reply += `• image issues\n\n`;
  } else {
    reply += `All jobs completed successfully or are running ✅\n\n`;
  }

  reply += `💡 You can:\n`;
  reply += `• describe a job\n`;
  reply += `• check related pods\n`;
  reply += `• view logs`;

  /* ================= RETURN ================= */
  return {
    reply,
    type: "jobs",
    data: result
  };
}

module.exports = { handleJobs };