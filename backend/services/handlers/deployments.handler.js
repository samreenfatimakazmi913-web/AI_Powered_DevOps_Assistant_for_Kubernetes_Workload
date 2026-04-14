const k8s = require("@kubernetes/client-node");
const { describeDeployment } = require("../kube.service");

// ===============================
// Kubernetes Config
// ===============================
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const appsApi = kc.makeApiClient(k8s.AppsV1Api);

// ===============================
// Helpers
// ===============================
function formatAge(creationTimestamp) {
  if (!creationTimestamp) return "-";

  const diff = Date.now() - new Date(creationTimestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  return `${days}d`;
}

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
// DEPLOYMENTS HANDLER
// ===============================
async function handleDeployments(intent) {
  const ns = intent.namespace || "default";

  /* ================= DESCRIBE ================= */
  if (intent.action === "describe") {
    if (!intent.name) {
      // Try to find a single deployment in scope and describe it automatically
      const nsList = parseNsList(ns);
      let allDeps = [];
      try {
        if (!nsList.length) {
          allDeps = (await appsApi.listDeploymentForAllNamespaces({})).items || [];
        } else {
          const results = await Promise.all(nsList.map(n => appsApi.listNamespacedDeployment({ namespace: n })));
          allDeps = results.flatMap(r => r.items || []);
        }
      } catch {}

      if (allDeps.length === 1) {
        const d = allDeps[0];
        const output = await describeDeployment(d.metadata.name, d.metadata.namespace);
        return { reply: `Details for deployment **\`${d.metadata.name}\`**:`, type: "logs", data: output };
      }

      const names = allDeps.map(d => `\`${d.metadata.name}\``).join(", ");
      return {
        reply: names
          ? `Which deployment would you like to describe? Available: ${names}`
          : "Please specify the deployment name.",
        type: "text",
      };
    }

    // Search for the deployment by name — partial match across scoped namespaces
    const nsList = parseNsList(ns);
    let allDeps = [];
    try {
      if (!nsList.length) {
        allDeps = (await appsApi.listDeploymentForAllNamespaces({})).items || [];
      } else {
        const results = await Promise.all(nsList.map(n => appsApi.listNamespacedDeployment({ namespace: n })));
        allDeps = results.flatMap(r => r.items || []);
      }
    } catch {}

    // Exact match first, then prefix/partial
    const exact   = allDeps.find(d => d.metadata.name === intent.name);
    const partial = !exact && allDeps.find(d => d.metadata.name.includes(intent.name));
    const target  = exact || partial;

    if (!target) {
      const names = allDeps.map(d => `\`${d.metadata.name}\``).join(", ");
      return {
        reply: names
          ? `I couldn't find a deployment named \`${intent.name}\`. Did you mean one of these?\n${names}`
          : `No deployments found in ${nsLabel(nsList)}.`,
        type: "text",
      };
    }

    try {
      const output = await describeDeployment(target.metadata.name, target.metadata.namespace);
      return {
        reply: `Details for deployment **\`${target.metadata.name}\`** in \`${target.metadata.namespace}\`:`,
        type: "logs",
        data: output,
      };
    } catch (err) {
      return {
        reply: `Found deployment \`${target.metadata.name}\` but couldn't fetch its details. Try again in a moment.`,
        type: "text",
      };
    }
  }

  /* ================= FETCH ================= */
  let deployments = [];
  const nsList = parseNsList(ns);

  try {
    if (!nsList.length) {
      deployments = (await appsApi.listDeploymentForAllNamespaces({})).items || [];
    } else if (nsList.length === 1) {
      deployments = (await appsApi.listNamespacedDeployment({ namespace: nsList[0] })).items || [];
    } else {
      const results = await Promise.all(nsList.map(n => appsApi.listNamespacedDeployment({ namespace: n })));
      deployments = results.flatMap(r => r.items || []);
    }
  } catch (err) {
    console.error("DEPLOYMENT FETCH ERROR:", err);
    return {
      reply: "Failed to fetch deployments.",
      type: "text"
    };
  }

  /* ================= ENRICH ================= */
  const enriched = deployments.map(d => {
    const desired = d.spec?.replicas || 0;
    const ready = d.status?.readyReplicas || 0;
    const available = d.status?.availableReplicas || 0;

    const unhealthy = ready < desired;

    return {
      name: d.metadata?.name,
      namespace: d.metadata?.namespace,
      replicas: desired,
      readyReplicas: ready,
      availableReplicas: available,
      age: formatAge(d.metadata?.creationTimestamp),
      unhealthy
    };
  });

  /* ================= FILTER ================= */
  let result = enriched;

  if (intent.filter === "unhealthy") {
    result = enriched.filter(d => d.unhealthy);
  }

  /* ================= HEALTH ================= */
  if (intent.action === "health" && !intent.filter) {
    result = enriched.filter(d => d.unhealthy);
  }

  /* ================= COUNT ================= */
  if (intent.output === "count") {
    return {
      reply: `Found ${result.length} deployment(s) ${nsLabel(nsList)}.`,
      type: "text"
    };
  }

  /* ================= INSIGHTS ================= */
  const unhealthyCount = enriched.filter(d => d.unhealthy).length;

  let reply = `Found ${result.length} deployment(s) ${nsLabel(nsList)}.\n\n`;

  if (unhealthyCount > 0) {
    reply += `⚠️ ${unhealthyCount} deployment(s) are not fully available.\n`;
    reply += `Possible reasons:\n`;
    reply += `• insufficient replicas\n`;
    reply += `• pod failures\n`;
    reply += `• rollout issues\n\n`;
  } else {
    reply += `All deployments are healthy ✅\n\n`;
  }

  reply += `💡 You can:\n`;
  reply += `• describe a deployment\n`;
  reply += `• check related pods\n`;
  reply += `• verify rollout status`;

  /* ================= RETURN ================= */
  return {
    reply,
    type: "deployments",
    data: result
  };
}

module.exports = { handleDeployments };