const k8s = require("@kubernetes/client-node");
const { describePod } = require("../kube.service");

// ===============================
// Kubernetes Config
// ===============================
const kc = new k8s.KubeConfig();

if (process.env.KUBERNETES_SERVICE_HOST) {
  kc.loadFromCluster();
} else {
  kc.loadFromDefault();
}

const coreApi = kc.makeApiClient(k8s.CoreV1Api);

// ===============================
// Helpers
// ===============================
function formatAge(creationTimestamp) {
  if (!creationTimestamp) return "-";

  const diff = Date.now() - new Date(creationTimestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function formatRestarts(containerStatuses = []) {
  const totalRestarts = containerStatuses.reduce(
    (sum, c) => sum + (c.restartCount || 0),
    0,
  );

  let lastRestartTime = null;

  containerStatuses.forEach((c) => {
    const finishedAt =
      c.lastState?.terminated?.finishedAt || c.lastState?.waiting?.startedAt;

    if (finishedAt) {
      const time = new Date(finishedAt);
      if (!lastRestartTime || time > lastRestartTime) {
        lastRestartTime = time;
      }
    }
  });

  if (totalRestarts === 0) return "0";
  if (!lastRestartTime) return `${totalRestarts}`;

  return `${totalRestarts} (${formatAge(lastRestartTime.toISOString())} ago)`;
}

function mapStatus(phase) {
  if (phase === "Succeeded") return "Completed";
  return phase;
}

// Parse "ns1,ns2" → ["ns1","ns2"]; "all"/empty → []
function parseNsList(ns) {
  if (!ns || ns === "all") return [];
  return ns
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function nsLabel(nsList) {
  if (!nsList.length) return "across all namespaces";
  if (nsList.length === 1) return `in the '${nsList[0]}' namespace`;
  return `across your namespaces (${nsList.join(", ")})`;
}

function getItems(response) {
  return response?.body?.items || response?.items || [];
}

// ===============================
// POD HANDLER
// ===============================
async function handlePods(intent) {
  const namespace = intent.namespace || "default";

  /* ================= DESCRIBE POD ================= */
  if (intent.action === "describe") {
    const searchNsList = parseNsList(intent.namespace || "");
    let allPods = [];
    try {
      if (!searchNsList.length || intent.namespace === "all") {
        const res = await coreApi.listPodForAllNamespaces();
        const items = res.body?.items || getItems(res);
        allPods = getItems(res);
      } else {
        // Fetch each namespace sequentially to stay consistent with coreApi response shape
        for (const ns of searchNsList) {
          const res = await coreApi.listNamespacedPod(ns);
          allPods.push(...getItems(res));
        }
      }
    } catch (err) {
      console.error("POD DESCRIBE FETCH ERROR:", err.message);
    }

    if (!intent.name) {
      if (allPods.length === 1) {
        const p = allPods[0];
        const output = await describePod(p.metadata.name, p.metadata.namespace);
        return {
          reply: `Details for pod **\`${p.metadata.name}\`**:`,
          type: "logs",
          data: output,
        };
      }
      const names = allPods
        .slice(0, 8)
        .map((p) => `\`${p.metadata.name}\``)
        .join(", ");
      return {
        reply: names
          ? `Which pod would you like to describe? Available: ${names}${allPods.length > 8 ? ` … and ${allPods.length - 8} more` : ""}`
          : "Please specify the pod name.",
        type: "text",
      };
    }

    // Find pod by exact then partial match
    const exact = allPods.find((p) => p.metadata?.name === intent.name);
    const partial =
      !exact && allPods.find((p) => p.metadata?.name?.includes(intent.name));
    const target = exact || partial;

    if (!target) {
      const names = allPods
        .slice(0, 8)
        .map((p) => `\`${p.metadata.name}\``)
        .join(", ");
      return {
        reply: names
          ? `I couldn't find a pod named \`${intent.name}\`. Did you mean one of these?\n${names}`
          : `No pods found in the current scope.`,
        type: "text",
      };
    }

    const output = await describePod(
      target.metadata.name,
      target.metadata.namespace,
    );
    return {
      reply: `Details for pod **\`${target.metadata.name}\`** in \`${target.metadata.namespace}\`:`,
      type: "logs",
      data: output,
    };
  }

  /* ================= NAMED-POD HEALTH ================= */
  // When the user says "why is <name> failing / crashing / not starting",
  // find that specific pod and show its events — don't do a broad sweep.
  if (
    intent.name &&
    (intent.action === "health" ||
      /\b(fail|crash|error|issue|problem|restart|down|not\s+start|not\s+ready)\b/i.test(
        intent.name,
      ))
  ) {
    const searchNsList = parseNsList(intent.namespace);
    let targetPod = null;

    const findInItems = (items) =>
      (items || []).find((p) =>
        p.metadata?.name?.toLowerCase().includes(intent.name.toLowerCase()),
      );

    if (!searchNsList.length) {
      const res = await coreApi.listPodForAllNamespaces();
      targetPod = findInItems(getItems(res));
    } else {
      for (const ns of searchNsList) {
        try {
          const res = await coreApi.listNamespacedPod(ns);
          targetPod = findInItems(getItems(res));
          if (targetPod) break;
        } catch {
          /* skip unreachable namespace */
        }
      }
    }

    if (!targetPod) {
      return {
        reply: [
          `I couldn't find a pod matching **\`${intent.name}\`** in ${searchNsList.length ? searchNsList.join(", ") : "the cluster"}.`,
          "",
          'Could you double-check the pod name? You can list pods with: _"show me all pods in staging"_',
        ].join("\n"),
        type: "text",
      };
    }

    const podName = targetPod.metadata.name;
    const podNs = targetPod.metadata.namespace;
    const containers = targetPod.status?.containerStatuses || [];

    // Determine health state
    const waitingReasons = containers
      .map((c) => c.state?.waiting?.reason)
      .filter(Boolean);
    const terminatedReasons = containers
      .map(
        (c) => c.state?.terminated?.reason || c.lastState?.terminated?.reason,
      )
      .filter(Boolean);
    const allReasons = [...new Set([...waitingReasons, ...terminatedReasons])];
    const readyCount = containers.filter((c) => c.ready).length;
    const totalC = targetPod.spec?.containers?.length || containers.length;

    let raw;
    try {
      raw = await describePod(podName, podNs);
    } catch {
      raw = "(could not fetch pod details)";
    }
    const eventsIdx = raw.indexOf("Events:");
    const eventSection =
      eventsIdx !== -1 ? raw.slice(eventsIdx) : "(no events section found)";

    const reasonNote = allReasons.length
      ? ` — reason: **${allReasons.join(", ")}**`
      : "";
    const readyNote = `${readyCount}/${totalC} containers ready`;

    return {
      reply: `Analyzing pod **\`${podName}\`** in namespace **\`${podNs}\`** (${readyNote}${reasonNote}):`,
      type: "logs",
      data: `--- Pod: ${podName} (${podNs}) ---\n${eventSection}`,
      pods: [
        {
          name: podName,
          namespace: podNs,
          status: targetPod.status?.phase,
          ready: `${readyCount}/${totalC}`,
          restarts: formatRestarts(containers),
          age: formatAge(targetPod.metadata?.creationTimestamp),
          reasons: allReasons,
          unhealthy: true,
        },
      ],
    };
  }

  /* ================= LIST / HEALTH PODS ================= */

  // 1️⃣ Fetch pods — support comma-separated multi-namespace
  const nsList = parseNsList(intent.namespace);
  let pods;
  if (!nsList.length) {
    const res = await coreApi.listPodForAllNamespaces();
    pods = getItems(res);
  } else if (nsList.length === 1) {
    const res = await coreApi.listNamespacedPod(nsList[0]);
    pods = getItems(res);
  } else {
    const results = await Promise.all(
      nsList.map((ns) => coreApi.listNamespacedPod(ns)),
    );
    pods = results.flatMap((r) => getItems(r));
  }

  // 2️⃣ Enrich pods
  const enrichedPods = pods.map((p) => {
    const containers = p.status?.containerStatuses || [];
    const readyCount = containers.filter((c) => c.ready).length;
    const totalContainers = p.spec?.containers?.length || containers.length;

    const waitingReasons = containers
      .map((c) => c.state?.waiting?.reason)
      .filter(Boolean);

    const terminatedReasons = containers
      .map(
        (c) => c.state?.terminated?.reason || c.lastState?.terminated?.reason,
      )
      .filter(Boolean);

    const isWaiting = waitingReasons.length > 0;
    const isNotReady =
      p.status?.phase === "Running" && readyCount < totalContainers;

    const isUnhealthy =
      p.status?.phase === "Failed" ||
      p.status?.phase === "Pending" ||
      isWaiting ||
      isNotReady;

    const allReasons = [...new Set([...waitingReasons, ...terminatedReasons])];

    return {
      name: p.metadata?.name,
      namespace: p.metadata?.namespace,
      status: mapStatus(p.status?.phase),
      ready: `${readyCount}/${totalContainers}`,
      restarts: formatRestarts(containers),
      age: formatAge(p.metadata?.creationTimestamp),
      unhealthy: isUnhealthy,
      reasons: allReasons,
    };
  });

  // 3️⃣ Apply filters
  let result = enrichedPods;

  // Health action → always filter to unhealthy
  if (intent.action === "health") {
    result = result.filter((p) => p.unhealthy === true);
  } else if (intent.filter && intent.filter !== "all") {
    switch (intent.filter) {
      case "running":
        result = result.filter((p) => p.status === "Running");
        break;
      case "successful":
        result = result.filter((p) => p.status === "Completed");
        break;
      case "failed":
        result = result.filter((p) => p.status === "Failed");
        break;
      case "pending":
        result = result.filter((p) => p.status === "Pending");
        break;
      case "unhealthy":
        result = result.filter((p) => p.unhealthy === true);
        break;
    }
  }

  // 4️⃣ Build reply text
  const nsLabelStr = nsLabel(nsList);

  // 5️⃣ For health queries on unhealthy pods, auto-describe each one
  if (
    (intent.action === "health" || intent.filter === "unhealthy") &&
    result.length > 0
  ) {
    // Fetch kubectl describe for up to 3 unhealthy pods and append events
    const descriptions = [];
    for (const pod of result.slice(0, 3)) {
      try {
        const raw = await describePod(pod.name, pod.namespace);
        // Extract only the Events section for brevity
        const eventsIdx = raw.indexOf("Events:");
        const eventSection =
          eventsIdx !== -1 ? raw.slice(eventsIdx) : "(no events found)";
        const reasonNote = pod.reasons.length
          ? ` [${pod.reasons.join(", ")}]`
          : "";
        descriptions.push(
          `--- Pod: ${pod.name} (${pod.namespace})${reasonNote} ---\n${eventSection}`,
        );
      } catch {
        descriptions.push(
          `--- Pod: ${pod.name} (${pod.namespace}) ---\n(could not describe pod)`,
        );
      }
    }

    const moreNote =
      result.length > 3
        ? `\n\n...and ${result.length - 3} more unhealthy pod(s).`
        : "";

    return {
      reply: `Found ${result.length} unhealthy pod(s) ${nsLabelStr}. Showing events below:`,
      type: "logs",
      data: descriptions.join("\n\n") + moreNote,
      pods: result, // also include the pod list for reference
    };
  }

  const filterLabel =
    intent.action === "health"
      ? "unhealthy"
      : intent.filter && intent.filter !== "all"
        ? intent.filter
        : "";

  return {
    reply: `Found ${result.length}${filterLabel ? " " + filterLabel : ""} pod(s) ${nsLabelStr}.`,
    type: "pods",
    data: result,
  };
}

module.exports = { handlePods };
