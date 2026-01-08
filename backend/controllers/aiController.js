const { analyzePrompt } = require("../services/aiService");
const k8s = require("@kubernetes/client-node");

// ===============================
// Kubernetes Config
// ===============================
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
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
    0
  );

  let lastRestartTime = null;

  containerStatuses.forEach(c => {
    const finishedAt =
      c.lastState?.terminated?.finishedAt ||
      c.lastState?.waiting?.startedAt;

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

// ===============================
// AI QUERY HANDLER
// ===============================
exports.handleAIQuery = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ reply: "No query provided." });
    }

    const intent = await analyzePrompt(message);

    if (intent.resource !== "pods") {
      return res.json({
        reply: "Currently, I can help with pod-related queries only.",
      });
    }

    // 1️⃣ Fetch all pods
    const { items } = await coreApi.listPodForAllNamespaces();
    let pods = items || [];

    // 2️⃣ Namespace filter
    if (intent.namespace && intent.namespace !== "all") {
      pods = pods.filter(
        p => p.metadata?.namespace === intent.namespace
      );
    }

    // ===============================
    // 3️⃣ Enrich pods (kubectl style)
    // ===============================
    const enrichedPods = pods.map(p => {
      const containers = p.status?.containerStatuses || [];
      const readyCount = containers.filter(c => c.ready).length;
      const totalContainers = containers.length;

      const restarts = containers.reduce(
        (sum, c) => sum + (c.restartCount || 0),
        0
      );

      // Waiting reasons (CrashLoopBackOff, ImagePullBackOff etc.)
      const waitingReasons = containers
        .map(c => c.state?.waiting?.reason)
        .filter(Boolean);

      // 🔴 UNHEALTHY LOGIC (CORE CHANGE)
      const isUnhealthy =
        p.status?.phase === "Failed" ||
        p.status?.phase === "Pending" ||
        readyCount < totalContainers ||
        restarts > 0 ||
        waitingReasons.length > 0;

      return {
        name: p.metadata?.name,
        namespace: p.metadata?.namespace,
        status: mapStatus(p.status?.phase),
        ready: `${readyCount}/${totalContainers}`,
        restarts: formatRestarts(containers),
        age: formatAge(p.metadata?.creationTimestamp),
        unhealthy: isUnhealthy,
        reasons: waitingReasons,
      };
    });

    // ===============================
    // 4️⃣ Apply FILTERS (UPDATED)
    // ===============================
    let result = enrichedPods;

    if (intent.filter && intent.filter !== "all") {
      switch (intent.filter) {
        case "running":
          result = result.filter(p => p.status === "Running");
          break;

        case "successful":
          result = result.filter(p => p.status === "Completed");
          break;

        case "failed":
          // Kubernetes strict failed phase only
          result = result.filter(p => p.status === "Failed");
          break;

        case "pending":
          result = result.filter(p => p.status === "Pending");
          break;

        case "unhealthy":
          // ⭐ REAL DEVOPS FILTER ⭐
          result = result.filter(p => p.unhealthy === true);
          break;
      }
    }

    // ===============================
    // 5️⃣ Scope-aware reply
    // ===============================
    let scopeText = "";

    if (intent.namespace === "default") {
      scopeText =
        " in the default namespace. To view pods across all namespaces, specify 'all namespaces'.";
    } else if (intent.namespace === "all") {
      scopeText = " across all namespaces.";
    } else {
      scopeText = ` in the '${intent.namespace}' namespace.`;
    }

    return res.json({
      reply: `Found ${result.length} ${intent.filter || "matching"} pods${scopeText}`,
      data: result,
    });

  } catch (err) {
    console.error("AI CONTROLLER ERROR:", err);
    return res.status(500).json({
      reply: "AI processing failed. Please try again.",
    });
  }
};
