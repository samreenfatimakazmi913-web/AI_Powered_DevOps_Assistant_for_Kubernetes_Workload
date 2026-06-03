const k8s = require("@kubernetes/client-node");

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const coreApi = kc.makeApiClient(k8s.CoreV1Api);
const appsApi = kc.makeApiClient(k8s.AppsV1Api);

// ===============================
function matchSelector(selector, labels) {
  if (!selector) return false;
  return Object.keys(selector).every((key) => labels[key] === selector[key]);
}

// ===============================
function isPodUnhealthy(pod) {
  const containers = pod.status?.containerStatuses || [];

  const readyCount = containers.filter((c) => c.ready).length;
  const totalContainers = containers.length;

  const waiting = containers.some((c) => c.state?.waiting);
  const notReady =
    pod.status?.phase === "Running" && readyCount < totalContainers;

  return (
    pod.status?.phase === "Failed" ||
    pod.status?.phase === "Pending" ||
    waiting ||
    notReady
  );
}

// ===============================
function isPodReady(pod) {
  const containers = pod.status?.containerStatuses || [];
  const conditions = pod.status?.conditions || [];

  // 1. Container level readiness
  const containersReady =
    containers.length > 0 && containers.every((c) => c.ready === true);

  // 2. Pod Ready condition
  const readyCondition = conditions.find((c) => c.type === "Ready");

  const podReady = readyCondition?.status === "True";

  return containersReady && podReady;
}

// ===============================
function findDeploymentForPod(pod, deployments) {
  const owners = pod.metadata?.ownerReferences || [];

  for (const o of owners) {
    if (o.kind === "ReplicaSet") {
      const dep = deployments.find((d) => o.name.startsWith(d.metadata?.name));
      if (dep) return dep.metadata.name;
    }
  }
  return "unknown";
}

function parseNsList(ns) {
  if (!ns || ns === "all") return [];
  return ns.split(",").map(s => s.trim()).filter(Boolean);
}
async function multiNsFetch(nsList, singleFn, allFn) {
  if (!nsList.length) return (await allFn()).items || [];
  const results = await Promise.all(nsList.map(n => singleFn(n)));
  return results.flatMap(r => r.items || []);
}

// ===============================
async function handleServices(intent) {
  const ns = intent.namespace || "default";
  const nsList = parseNsList(ns);

  let services = [];
  let pods = [];
  let deployments = [];

  try {
    [services, pods, deployments] = await Promise.all([
      multiNsFetch(nsList, n => coreApi.listNamespacedService({ namespace: n }), () => coreApi.listServiceForAllNamespaces({})),
      multiNsFetch(nsList, n => coreApi.listNamespacedPod({ namespace: n }), () => coreApi.listPodForAllNamespaces({})),
      multiNsFetch(nsList, n => appsApi.listNamespacedDeployment({ namespace: n }), () => appsApi.listDeploymentForAllNamespaces({})),
    ]);
  } catch (err) {
    return { reply: "Failed to fetch resources", type: "text" };
  }

  // ===============================
  const enriched = services.map((s) => {
    const selector = s.spec?.selector || {};

    const matchedPods = pods.filter((p) =>
      matchSelector(selector, p.metadata?.labels || {}),
    );

    const readyPods = matchedPods.filter(isPodReady);
    const unhealthyPods = matchedPods.filter(isPodUnhealthy);

    let issueType = "healthy";

    if (matchedPods.length === 0) {
      issueType = "NO_PODS";
    } else if (readyPods.length === 0) {
      issueType = "NO_ENDPOINTS";
    } else if (unhealthyPods.length > 0) {
      issueType = "UNHEALTHY_PODS";
    }
    console.log("SERVICE:", s.metadata?.name);
    console.log("Matched:", matchedPods.length);
    console.log("ReadyPods:", readyPods.length);

    return {
      name: s.metadata?.name,
      namespace: s.metadata?.namespace,
      type: s.spec?.type,
      matchedPodsCount: matchedPods.length,
      clusterIP: s.spec?.clusterIP,
      issueType,
      

      pods: matchedPods.map((p) => ({
        name: p.metadata?.name,
        deployment: findDeploymentForPod(p, deployments),
      })),

      unhealthyPodsCount: unhealthyPods.length,
    };
  });

  // ===============================
  let result = enriched;

  if (intent.name) {
    result = enriched.filter(
      (s) => s.name.toLowerCase() === intent.name.toLowerCase(),
    );

    if (result.length === 0) {
      return { reply: "Service not found", type: "text" };
    }
  }

  // ===============================
  let hasIssues = result.some((s) => s.issueType !== "healthy");

  // ===============================
  let reply = `📊 Summary:\n`;

  if (intent.name) {
    reply += `Service: ${intent.name}\n\n`;
  } else {
    reply += `Checked ${enriched.length} service(s)\n\n`;
  }

  // ===============================
  if (!hasIssues) {
    reply += intent.name
      ? `No issues detected. Service is healthy ✅\n\n`
      : `All services are healthy ✅\n\n`;
  } else {
    reply += `🔍 Root Cause Analysis:\n`;

    result.forEach((s) => {
      if (s.issueType === "NO_PODS") {
        reply += `• ${s.name}: No pods matched\n`;
      }

      if (s.issueType === "NO_ENDPOINTS") {
        reply += `• ${s.name}: No endpoints (pods not ready)\n`;
      }

      if (s.issueType === "UNHEALTHY_PODS") {
        reply += `• ${s.name}: ${s.unhealthyPodsCount} unhealthy pods\n`;
      }
    });

    reply += `\n💡 Actions:\n• Check deployment\n• Check pods\n`;
  }

  return {
    reply,
    type: "services",
    data: result, // ✅ ALWAYS return correct data
  };
}

module.exports = { handleServices };
