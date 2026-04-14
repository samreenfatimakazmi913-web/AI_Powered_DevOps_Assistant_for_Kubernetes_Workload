// ===============================
// backend/index.js
// ===============================

require("dotenv").config();
const connectDB = require("./config/db");
const { runTroubleshootTool, getDebugPodStatus } = require("./services/kube.service");

const express = require("express");
const cors = require("cors");
const k8s = require("@kubernetes/client-node");
const axios = require("axios");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/teams", require("./routes/teamRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/uploads", express.static("uploads"));

// ---------------- K8s CONFIG ----------------
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const coreApi = kc.makeApiClient(k8s.CoreV1Api);
const appsApi = kc.makeApiClient(k8s.AppsV1Api);
const batchApi = kc.makeApiClient(k8s.BatchV1Api);
const metricsApi = kc.makeApiClient(k8s.CustomObjectsApi);

// ---------------- HEALTH ----------------
app.get("/", (req, res) => {
  res.send("🚀 Kubernetes Backend API is running");
});

// ---------------- HELPERS ----------------
// Accept ?namespace=ns1,ns2 or ?namespace=ns1 — returns [] for "all namespaces"
function parseNamespaces(query) {
  const raw = query.namespace || query.namespaces || "";
  if (!raw) return [];
  return raw.split(",").map(s => s.trim()).filter(Boolean);
}

// Fetch a namespaced resource for each ns, then flatten; falls back to cluster-wide
async function multiNsFetch(nsList, singleFn, allFn) {
  if (!nsList.length) {
    const { items } = await allFn();
    return items;
  }
  const results = await Promise.all(nsList.map(ns => singleFn(ns)));
  return results.flatMap(r => r.items);
}

// ---------------- BASIC RESOURCES ----------------
app.get("/api/pods", async (req, res) => {
  try {
    const nsList = parseNamespaces(req.query);
    const items = await multiNsFetch(
      nsList,
      ns => coreApi.listNamespacedPod({ namespace: ns }),
      () => coreApi.listPodForAllNamespaces()
    );
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pods" });
  }
});

app.get("/api/nodes", async (req, res) => {
  try {
    const { items } = await coreApi.listNode();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch nodes" });
  }
});

app.get("/api/deployments", async (req, res) => {
  try {
    const nsList = parseNamespaces(req.query);
    const items = await multiNsFetch(
      nsList,
      ns => appsApi.listNamespacedDeployment({ namespace: ns }),
      () => appsApi.listDeploymentForAllNamespaces()
    );
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch deployments" });
  }
});

app.get("/api/daemonsets", async (req, res) => {
  try {
    const nsList = parseNamespaces(req.query);
    const items = await multiNsFetch(
      nsList,
      ns => appsApi.listNamespacedDaemonSet({ namespace: ns }),
      () => appsApi.listDaemonSetForAllNamespaces()
    );
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch daemonsets" });
  }
});

app.get("/api/statefulsets", async (req, res) => {
  try {
    const nsList = parseNamespaces(req.query);
    const items = await multiNsFetch(
      nsList,
      ns => appsApi.listNamespacedStatefulSet({ namespace: ns }),
      () => appsApi.listStatefulSetForAllNamespaces()
    );
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch statefulsets" });
  }
});

app.get("/api/jobs", async (req, res) => {
  try {
    const nsList = parseNamespaces(req.query);
    const items = await multiNsFetch(
      nsList,
      ns => batchApi.listNamespacedJob({ namespace: ns }),
      () => batchApi.listJobForAllNamespaces()
    );
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

app.get("/api/cronjobs", async (req, res) => {
  try {
    const nsList = parseNamespaces(req.query);
    const items = await multiNsFetch(
      nsList,
      ns => batchApi.listNamespacedCronJob({ namespace: ns }),
      () => batchApi.listCronJobForAllNamespaces()
    );
    res.json(items);
  } catch {
    res.json([]);
  }
});

// ---------------- NAMESPACES ----------------
app.get("/api/namespaces", async (req, res) => {
  try {
    const nsList = parseNamespaces(req.query);
    if (nsList.length) return res.json(nsList);
    const { items } = await coreApi.listNamespace();
    res.json(items.map(ns => ns.metadata.name));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch namespaces" });
  }
});

// ---------------- LOGS ----------------
app.get("/api/logs/:namespace/:pod", async (req, res) => {
  const { namespace, pod } = req.params;
  const { container, previous, tail = "200" } = req.query;

  try {
    const params = {
      name: pod,
      namespace,
      tailLines: parseInt(tail, 10),
    };
    if (container) params.container = container;
    if (previous === "true") params.previous = true;

    const logs = await coreApi.readNamespacedPodLog(params);
    res.type("text/plain").send(logs || "No logs available");
  } catch (err) {
    console.error("❌ LOG ERROR:", err);
    res.status(500).json({
      error: "Failed to fetch logs",
      details: err.message,
    });
  }
});

// ---------------- POD CONTAINERS ----------------
app.get("/api/pods/:namespace/:pod/containers", async (req, res) => {
  try {
    const pod = await coreApi.readNamespacedPod({
      name: req.params.pod,
      namespace: req.params.namespace,
    });
    const containers = (pod.spec.containers || []).map(c => c.name);
    const initContainers = (pod.spec.initContainers || []).map(c => c.name);
    res.json({ containers, initContainers });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pod containers" });
  }
});

// ---------------- EVENTS ----------------
app.get("/api/events", async (req, res) => {
  try {
    const nsList = parseNamespaces(req.query);
    const items = await multiNsFetch(
      nsList,
      ns => coreApi.listNamespacedEvent({ namespace: ns }),
      () => coreApi.listEventForAllNamespaces()
    );

    const events = items
      .map(e => ({
        namespace: e.metadata.namespace,
        type: e.type,
        reason: e.reason,
        message: e.message,
        object: `${e.involvedObject.kind}/${e.involvedObject.name}`,
        objectKind: e.involvedObject.kind,
        objectName: e.involvedObject.name,
        count: e.count || 1,
        lastTime: e.lastTimestamp || e.metadata.creationTimestamp,
      }))
      .sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime))
      .slice(0, 200);

    res.json(events);
  } catch (err) {
    console.error("❌ EVENTS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// ---------------- TROUBLESHOOT ----------------

// Blocklist — commands that could destroy cluster state or the node
const BLOCKED_PATTERNS = [
  /^\s*rm\s+-rf/i,
  /\bdd\s+if=/i,
  /mkfs\./i,
  />\s*\/dev\//i,
  /kubectl\s+delete\s+namespace/i,
  /kubectl\s+delete\s+node/i,
];

const TROUBLESHOOT_TOOL_RULES = {
  curl: {
    label: "curl",
    allowedCommands: ["curl"],
  },
  nc: {
    label: "nc",
    allowedCommands: ["nc"],
  },
  netshoot: {
    label: "netshoot",
    allowedCommands: ["ping", "traceroute", "nslookup", "dig", "host", "ip", "ss", "arp", "cat", "ps", "env", "df", "free", "uname"],
  },
};

const BLOCKED_SHELL_OPERATORS = [
  /\&\&/,
  /\|\|/,
  /;/,
  /\|/,
  /`/,
  /\$\(/,
];

function validateTroubleshootCommand(tool, command) {
  if (!tool || !TROUBLESHOOT_TOOL_RULES[tool]) {
    return "Select a valid troubleshooting tool.";
  }

  const trimmed = String(command || "").trim();
  if (!trimmed) {
    return "Command is required.";
  }

  if (BLOCKED_SHELL_OPERATORS.some(pattern => pattern.test(trimmed))) {
    return "Shell chaining and command substitution are not allowed in troubleshooting commands.";
  }

  const firstToken = trimmed.split(/\s+/)[0]?.toLowerCase();
  const allowed = TROUBLESHOOT_TOOL_RULES[tool].allowedCommands;

  if (!allowed.includes(firstToken)) {
    const allowedList = allowed.map(cmd => `\`${cmd}\``).join(", ");
    return `The selected tool is ${TROUBLESHOOT_TOOL_RULES[tool].label}. Use only ${allowedList} commands.`;
  }

  return null;
}

// Status of the debug-shell pod in a namespace
app.get("/api/troubleshoot/status/:namespace", async (req, res) => {
  try {
    const phase = await getDebugPodStatus(req.params.namespace);
    res.json({ phase });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/troubleshoot/run", async (req, res) => {
  const { namespace, command, tool, userNamespaces = [] } = req.body;

  if (!namespace || !command || !tool) {
    return res.status(400).json({ error: "namespace, tool and command are required" });
  }

  if (Array.isArray(userNamespaces) && userNamespaces.length && !userNamespaces.includes(namespace)) {
    return res.status(403).json({ error: "You do not have access to troubleshoot this namespace." });
  }

  // Safety: block dangerous patterns
  if (BLOCKED_PATTERNS.some(p => p.test(command))) {
    return res.status(400).json({ error: "Command blocked for safety reasons." });
  }

  const validationError = validateTroubleshootCommand(tool, command);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Wire an AbortController to the HTTP connection so that when the
  // frontend cancels (fetch abort) or the client disconnects, the
  // kubectl exec child process is killed immediately.
  const ac = new AbortController();
  req.on("close", () => ac.abort());

  try {
    const output = await runTroubleshootTool(namespace, command, ac.signal);
    if (!res.headersSent) res.json({ output });
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: err.message || err.toString() });
  }
});
// ---------------- SERVICES ----------------
app.get("/api/services/:namespace", async (req, res) => {

  console.log("SERVICE API HIT:", req.params.namespace);

  try {

    const namespace = req.params.namespace;

    const response = await coreApi.listNamespacedService({
      namespace: namespace
    });

    const services = response.items.map(s => s.metadata.name);

    res.json(services);

  } catch (err) {

    console.error("❌ SERVICE ERROR:", err);

    res.status(500).json({ error: err.message });

  }
});


//--------------------SERVICE PORTS -----------------
app.get("/api/service-ports/:namespace/:service", async (req, res) => {

  try {

    const { namespace, service } = req.params;

    const response = await coreApi.readNamespacedService({
      name: service,
      namespace: namespace
    });

    const ports = response.spec.ports.map(p => p.port);

    res.json(ports);

  } catch (err) {

    console.error("❌ PORT ERROR:", err);

    res.status(500).json({ error: err.message });

  }

});

// ---------------- CONTAINER METRICS (per-pod, per-container) ----------------
app.get("/api/container-metrics", async (req, res) => {
  try {
    const nsList = parseNamespaces(req.query);

    let items = [];
    if (nsList.length) {
      const responses = await Promise.all(
        nsList.map(ns =>
          metricsApi.listNamespacedCustomObject({
            group: "metrics.k8s.io", version: "v1beta1", namespace: ns, plural: "pods",
          })
        )
      );
      items = responses.flatMap(r => r.body?.items || r.items || []);
    } else {
      const metricsResponse = await metricsApi.listClusterCustomObject({
        group: "metrics.k8s.io", version: "v1beta1", plural: "pods",
      });
      items = metricsResponse.body?.items || metricsResponse.items || [];
    }

    function parseCpu(raw = "0") {
      if (raw.endsWith("n")) return Math.round(parseInt(raw) / 1e6); // nanocores → millicores
      if (raw.endsWith("m")) return parseInt(raw);
      return parseInt(raw) * 1000;
    }
    function parseMem(raw = "0") {
      if (raw.endsWith("Ki")) return Math.round(parseInt(raw) / 1024);
      if (raw.endsWith("Mi")) return parseInt(raw);
      if (raw.endsWith("Gi")) return Math.round(parseFloat(raw) * 1024);
      return 0;
    }

    const result = items.map(pod => ({
      pod:       pod.metadata.name,
      namespace: pod.metadata.namespace,
      containers: (pod.containers || []).map(c => ({
        name:   c.name,
        cpu:    parseCpu(c.usage?.cpu),
        memory: parseMem(c.usage?.memory),
      })),
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ CONTAINER METRICS ERROR:", err.message);
    res.status(500).json({ error: "Metrics Server unavailable or not installed", details: err.message });
  }
});

// ---------------- SCRAPE /metrics FROM INSIDE THE CLUSTER ----------------
// Uses the debug-shell (nicolaka/netshoot) pod to curl the target service endpoint.
app.get("/api/scrape-metrics", async (req, res) => {
  const { namespace, service, port } = req.query;
  if (!namespace || !service || !port) {
    return res.status(400).json({ error: "namespace, service, port are required" });
  }

  const url = `http://${service}.${namespace}.svc.cluster.local:${port}/metrics`;
  const command = `curl -sf --max-time 10 ${url}`;

  const ac = new AbortController();
  req.on("close", () => ac.abort());

  try {
    const output = await runTroubleshootTool(namespace, command, ac.signal);
    if (!output || output.startsWith("⚠") || output.toLowerCase().includes("failed")) {
      return res.json({ noMetrics: true, message: `Service does not expose /metrics at ${url}` });
    }
    res.json({ raw: output });
  } catch (err) {
    res.json({ noMetrics: true, message: err.message });
  }
});


// ---------------- POD METRICS (DEPLOYMENT GROUPED - FIXED) ----------------
app.get("/api/pod-metrics", async (req, res) => {
  try {
    const nsList = parseNamespaces(req.query);

    // 1️⃣ Get pod metrics — support multiple namespaces
    let metricItems = [];
    if (nsList.length) {
      const responses = await Promise.all(
        nsList.map(ns =>
          metricsApi.listNamespacedCustomObject({
            group: "metrics.k8s.io",
            version: "v1beta1",
            namespace: ns,
            plural: "pods",
          })
        )
      );
      metricItems = responses.flatMap(r => r.body?.items || r.items || []);
    } else {
      const metricsResponse = await metricsApi.listClusterCustomObject({
        group: "metrics.k8s.io",
        version: "v1beta1",
        plural: "pods",
      });
      metricItems = metricsResponse.body?.items || metricsResponse.items || [];
    }

    // 2️⃣ Get all pods
    const { items: allPods } = await coreApi.listPodForAllNamespaces();

    // 3️⃣ Create lookup map
    const podMap = {};
    allPods.forEach(pod => {
      const key = `${pod.metadata.namespace}/${pod.metadata.name}`;
      podMap[key] = pod;
    });

    // 4️⃣ Deployment aggregation
    const deploymentMap = {};

    for (const podMetric of metricItems) {

      let cpuTotal = 0;
      let memoryTotal = 0;

      // Calculate container usage
      for (const container of podMetric.containers || []) {

        const cpuRaw = container.usage?.cpu || "0m";
        const memRaw = container.usage?.memory || "0Ki";

        // CPU → millicores
        if (cpuRaw.endsWith("n")) {
          cpuTotal += Math.round(parseInt(cpuRaw) / 1e6); // nanocores → millicores
        } else if (cpuRaw.endsWith("m")) {
          cpuTotal += parseInt(cpuRaw);
        } else {
          cpuTotal += parseInt(cpuRaw) * 1000; // whole cores → millicores
        }

        // Memory → MiB
        if (memRaw.endsWith("Ki")) {
          memoryTotal += parseInt(memRaw) / 1024;
        } else if (memRaw.endsWith("Mi")) {
          memoryTotal += parseInt(memRaw);
        } else if (memRaw.endsWith("Gi")) {
          memoryTotal += parseInt(memRaw) * 1024;
        } else if (memRaw.endsWith("k")) {
          memoryTotal += parseInt(memRaw) / 1000;
        }
      }

      const podKey = `${podMetric.metadata.namespace}/${podMetric.metadata.name}`;
      const fullPod = podMap[podKey];

      let deploymentName = "System";

      if (fullPod?.metadata?.ownerReferences?.length) {

        const owner = fullPod.metadata.ownerReferences[0];

        if (owner.kind === "ReplicaSet") {
          try {
            const rs = await appsApi.readNamespacedReplicaSet({
              name: owner.name,
              namespace: fullPod.metadata.namespace,
            });

            const rsOwner = (rs.body || rs).metadata.ownerReferences?.[0];

            if (rsOwner?.kind === "Deployment") {
              deploymentName = rsOwner.name;
            } else {
              deploymentName = owner.name;
            }

          } catch {
            deploymentName = owner.name;
          }

        } else if (
          owner.kind === "StatefulSet" ||
          owner.kind === "DaemonSet"
        ) {
          deploymentName = owner.name;
        }
      }

      if (!deploymentMap[deploymentName]) {
        deploymentMap[deploymentName] = {
          deployment: deploymentName,
          cpu: 0,
          memory: 0,
        };
      }

      deploymentMap[deploymentName].cpu += cpuTotal;
      deploymentMap[deploymentName].memory += Math.round(memoryTotal);
    }

    res.json(Object.values(deploymentMap));

  } catch (err) {
    console.error("❌ METRICS ERROR:", err);
    res.status(500).json({
      error: "Failed to fetch deployment metrics",
      details: err.message,
    });
  }
});

// ---------------- PERSISTENT VOLUMES ----------------
// PVs are cluster-scoped; PVCs are namespace-scoped.
// Returns combined stats: each PV with its claim info (if bound).
app.get("/api/volumes", async (req, res) => {
  try {
    const nsList = parseNamespaces(req.query);

    // Always fetch all PVs (cluster-scoped)
    const { items: pvs } = await coreApi.listPersistentVolume();

    // Fetch PVCs — scoped per namespace if developer, otherwise all
    let pvcs = [];
    try {
      pvcs = await multiNsFetch(
        nsList,
        ns => coreApi.listNamespacedPersistentVolumeClaim({ namespace: ns }),
        ()  => coreApi.listPersistentVolumeClaimForAllNamespaces()
      );
    } catch { /* PVCs are optional for the summary */ }

    // Build a quick lookup: PV name → bound PVC info
    const pvcByPv = {};
    for (const pvc of pvcs) {
      const pvName = pvc.spec?.volumeName;
      if (pvName) pvcByPv[pvName] = pvc;
    }

    const result = pvs.map(pv => {
      const capacity   = pv.spec?.capacity?.storage || "?";
      const phase      = pv.status?.phase || "Unknown"; // Available, Bound, Released, Failed
      const claim      = pv.spec?.claimRef;
      const boundPvc   = pvcByPv[pv.metadata?.name];
      const accessModes = (pv.spec?.accessModes || []).join(", ");
      const storageClass = pv.spec?.storageClassName || "-";
      const reclaimPolicy = pv.spec?.persistentVolumeReclaimPolicy || "-";

      return {
        name:           pv.metadata?.name,
        capacity,
        phase,
        accessModes,
        storageClass,
        reclaimPolicy,
        claimNamespace: claim?.namespace || null,
        claimName:      claim?.name      || null,
        // Is this PV accessible in the developer's namespaces?
        inScope: !nsList.length || (claim?.namespace && nsList.includes(claim.namespace)),
      };
    });

    // For namespace-scoped users, only return PVs that are bound to their namespaces
    // (plus unbound ones so they see the full cluster picture)
    const scoped = nsList.length
      ? result.filter(v => !v.claimNamespace || nsList.includes(v.claimNamespace))
      : result;

    res.json(scoped);
  } catch (err) {
    console.error("❌ VOLUMES ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch volumes", details: err.message });
  }
});

// ---------------- SERVER ----------------
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
