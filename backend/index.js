// ===============================
// backend/index.js
// ===============================

require("dotenv").config();     // ENV CONFIG
const connectDB = require("./config/db");     // DB IMPORT

const express = require("express");
const cors = require("cors");
const k8s = require("@kubernetes/client-node");

connectDB(); //  DB CONNECT

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/teams", require("./routes/teamRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));


// ---------------- K8s CONFIG ----------------
const kc = new k8s.KubeConfig();
kc.loadFromDefault(); // uses current kubectl context

const coreApi = kc.makeApiClient(k8s.CoreV1Api);
const appsApi = kc.makeApiClient(k8s.AppsV1Api);
const batchApi = kc.makeApiClient(k8s.BatchV1Api); // ✅ ONLY THIS

// ---------------- HEALTH ----------------
app.get("/", (req, res) => {
  res.send("🚀 Kubernetes Backend API is running");
});

// ---------------- PODS ----------------
app.get("/api/pods", async (req, res) => {
  try {
    const { items } = await coreApi.listPodForAllNamespaces();
    res.json(items);
  } catch (err) {
    console.error("❌ POD ERROR:", err);
    res.status(500).json({ error: "Failed to fetch pods" });
  }
});

// ---------------- NODES ----------------
app.get("/api/nodes", async (req, res) => {
  try {
    const { items } = await coreApi.listNode();
    res.json(items);
  } catch (err) {
    console.error("❌ NODE ERROR:", err);
    res.status(500).json({ error: "Failed to fetch nodes" });
  }
});

// ---------------- DEPLOYMENTS ----------------
app.get("/api/deployments", async (req, res) => {
  try {
    const { items } = await appsApi.listDeploymentForAllNamespaces();
    res.json(items);
  } catch (err) {
    console.error("❌ DEPLOYMENT ERROR:", err);
    res.status(500).json({ error: "Failed to fetch deployments" });
  }
});

// ---------------- JOBS ----------------
app.get("/api/jobs", async (req, res) => {
  try {
    const { items } = await batchApi.listJobForAllNamespaces();
    res.json(items);
  } catch (err) {
    console.error("❌ JOB ERROR:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// ---------------- CRONJOBS (🔥 FIXED) ----------------
app.get("/api/cronjobs", async (req, res) => {
  try {
    const { items } = await batchApi.listCronJobForAllNamespaces();
    res.json(items);
  } catch (err) {
    console.error("❌ CRONJOB ERROR:", err);
    res.json([]); // fail-safe
  }
});

// ---------------- LOGS ----------------
app.get("/api/logs/:namespace/:pod", async (req, res) => {
  const { namespace, pod } = req.params;

  try {
    const logs = await coreApi.readNamespacedPodLog({
      name: pod,
      namespace,
      tailLines: 200,
    });

    res.type("text/plain").send(logs || "No logs available");
  } catch (err) {
    console.error("❌ LOG ERROR:", err);
    res.status(500).json({
      error: "Failed to fetch logs",
      details: err.message,
    });
  }
});

// ---------------- SERVER ----------------
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
