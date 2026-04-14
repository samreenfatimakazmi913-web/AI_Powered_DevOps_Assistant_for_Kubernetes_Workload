const { exec } = require("child_process");

/* =====================================================
   GET PODS (INDUSTRY-LEVEL DETAILS)
   - name
   - status
   - restarts
   - node
   - age
===================================================== */
function getPods(namespace = "ai-demo") {
  return new Promise((resolve, reject) => {
    const cmd = `kubectl get pods -n ${namespace} -o json`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("kubectl get pods error:", stderr);
        return reject(stderr || error.message);
      }

      const data = JSON.parse(stdout);
      const now = new Date();

      const pods = data.items.map(pod => {
        const startTime = pod.status.startTime
          ? new Date(pod.status.startTime)
          : null;

        const ageMinutes = startTime
          ? Math.floor((now - startTime) / 60000)
          : "N/A";

        const restarts = pod.status.containerStatuses
          ? pod.status.containerStatuses.reduce(
              (sum, c) => sum + (c.restartCount || 0),
              0
            )
          : 0;

        return {
          name: pod.metadata.name,
          status: pod.status.phase,
          restarts,
          node: pod.spec.nodeName || "N/A",
          age: ageMinutes
        };
      });

      resolve(pods);
    });
  });
}

/* =====================================================
   GET POD METRICS (CPU / MEMORY)
===================================================== */
function getPodMetrics(namespace = "ai-demo") {
  return new Promise((resolve, reject) => {
    const cmd = `kubectl top pods -n ${namespace}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("kubectl top pods error:", stderr);
        return reject(stderr || error.message);
      }

      const lines = stdout.trim().split("\n").slice(1);

      const metrics = lines.map(line => {
        const [name, cpu, memory] = line.split(/\s+/);
        return {
          name,
          cpu,
          memory
        };
      });

      resolve(metrics);
    });
  });
}

/* =====================================================
   GET POD LOGS (LAST 50 LINES)
===================================================== */
function getPodLogs(podName, namespace = "ai-demo") {
  return new Promise((resolve, reject) => {
    const cmd = `kubectl logs ${podName} -n ${namespace} --tail=50`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("kubectl logs error:", stderr);
        return reject(stderr || error.message);
      }

      resolve(stdout);
    });
  });
}

/* =====================================================
   GET POD EVENTS (WHY FAILED / PENDING)
===================================================== */
function getPodEvents(podName, namespace = "ai-demo") {
  return new Promise((resolve, reject) => {
    const cmd = `kubectl describe pod ${podName} -n ${namespace}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("kubectl describe pod error:", stderr);
        return reject(stderr || error.message);
      }

      // Extract only Events section
      const eventsIndex = stdout.indexOf("Events:");
      if (eventsIndex === -1) {
        return resolve("No events found for this pod.");
      }

      const events = stdout.slice(eventsIndex);
      resolve(events);
    });
  });
}

/* =====================================================
   DEBUG POD — status check (used by /api/troubleshoot/status)
===================================================== */
function getDebugPodStatus(namespace) {
  return new Promise((resolve) => {
    const cmd = `kubectl get pod debug-shell -n ${namespace} -o jsonpath="{.status.phase}" --ignore-not-found`;
    exec(cmd, (err, stdout) => {
      resolve((stdout || "").trim() || "NotFound");
    });
  });
}

/* =====================================================
   creating pod for debug shell
===================================================== */
function ensureDebugPod(namespace) {
  return new Promise((resolve, reject) => {

    const statusCmd = `kubectl get pod debug-shell -n ${namespace} -o json --ignore-not-found`;

    exec(statusCmd, (err, stdout) => {

      let phase = "NotFound";
      if (stdout && stdout.trim()) {
        try { phase = JSON.parse(stdout).status?.phase || "Unknown"; } catch {}
      }

      console.log(`[debug-shell] namespace=${namespace} phase=${phase}`);

      if (phase === "Running") return resolve();

      if (phase === "Failed" || phase === "Succeeded") {
        console.log("[debug-shell] pod completed/failed → deleting and recreating");
        exec(`kubectl delete pod debug-shell -n ${namespace} --ignore-not-found`, () => createAndWait());
      } else {
        // NotFound, Pending, Unknown, or parse error → create fresh
        createAndWait();
      }
    });

    function createAndWait() {
      const createCmd = [
        "kubectl run debug-shell",
        "--image=nicolaka/netshoot",
        "--restart=Never",
        `--namespace=${namespace}`,
        "--command -- sleep infinity",
      ].join(" ");

      exec(createCmd, (createErr) => {
        if (createErr) {
          // Pod might already exist (race condition) — proceed to wait anyway
          console.warn("[debug-shell] create warning:", createErr.message);
        }
        waitUntilReady();
      });
    }

    function waitUntilReady() {
      // kubectl wait is the reliable way — timeout 90s for slow image pulls
      const waitCmd = `kubectl wait pod debug-shell -n ${namespace} --for=condition=Ready --timeout=90s`;
      console.log("[debug-shell] waiting for pod to be Ready…");
      exec(waitCmd, (waitErr, stdout) => {
        if (waitErr) {
          console.error("[debug-shell] wait failed:", waitErr.message);
          return reject(new Error("Debug pod did not become Ready in time. Try again or check image pull status."));
        }
        console.log("[debug-shell] pod is Ready:", stdout.trim());
        resolve();
      });
    }

  });
}
/* =====================================================
   GET NameSpaces
===================================================== */

function getNamespaces() {
  return new Promise((resolve, reject) => {
    const cmd = `kubectl get namespaces -o json`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("kubectl get namespaces error:", stderr);
        return reject(stderr || error.message);
      }

      const data = JSON.parse(stdout);
      const now = new Date();

      const namespaces = data.items.map(ns => {
        const created = new Date(ns.metadata.creationTimestamp);
        const ageDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));

        return {
          name: ns.metadata.name,
          status: ns.status.phase,
          age: `${ageDays}d`
        };
      });

      resolve(namespaces);
    });
  });
}


/* ===============================
   GET JOBS
=============================== */
function getJobs(namespace = "default") {
  return new Promise((resolve, reject) => {
    const { exec } = require("child_process");

    const cmd =
      namespace === "all"
        ? `kubectl get jobs --all-namespaces -o json`
        : `kubectl get jobs -n ${namespace} -o json`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("kubectl get jobs error:", stderr);
        return reject(stderr || error.message);
      }

      const data = JSON.parse(stdout);
      const now = new Date();

      const jobs = data.items.map(j => {
        const start = new Date(
          j.status.startTime || j.metadata.creationTimestamp
        );
        const age = Math.floor((now - start) / 60000);

        return {
          name: j.metadata.name,
          namespace: j.metadata.namespace,
          completions: `${j.status.succeeded || 0}/${j.spec.completions || 1}`,
          status: j.status.succeeded ? "Completed" : "Running",
          age: `${age}m`
        };
      });

      resolve(jobs);
    });
  });
}


/* ===============================
   GET CRONJOBS
=============================== */
function getCronJobs(namespace = "default") {
  return new Promise((resolve, reject) => {
    const { exec } = require("child_process");

    const cmd =
      namespace === "all"
        ? `kubectl get cronjobs --all-namespaces -o json`
        : `kubectl get cronjobs -n ${namespace} -o json`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("kubectl get cronjobs error:", stderr);
        return reject(stderr || error.message);
      }

      const data = JSON.parse(stdout);

      const cronjobs = data.items.map(cj => ({
        name: cj.metadata.name,
        namespace: cj.metadata.namespace,
        schedule: cj.spec.schedule,
        suspend: cj.spec.suspend ? "Yes" : "No",
        lastSchedule: cj.status.lastScheduleTime || "-",
        active: cj.status.active ? cj.status.active.length : 0
      }));

      resolve(cronjobs);
    });
  });
}

function describeJob(jobName, namespace = "default") {
  return new Promise((resolve, reject) => {
    const { exec } = require("child_process");
    const cmd = `kubectl describe job ${jobName} -n ${namespace}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("kubectl describe job error:", stderr);
        return reject(stderr || error.message);
      }

      resolve(stdout);
    });
  });
}

function describeCronJob(cronJobName, namespace = "default") {
  return new Promise((resolve, reject) => {
    const { exec } = require("child_process");
    const cmd = `kubectl describe cronjob ${cronJobName} -n ${namespace}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("kubectl describe cronjob error:", stderr);
        return reject(stderr || error.message);
      }

      resolve(stdout);
    });
  });
}

function describePod(podName, namespace = "default") {
  return new Promise((resolve, reject) => {
    const { exec } = require("child_process");
    const cmd = `kubectl describe pod ${podName} -n ${namespace}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("kubectl describe pod error:", stderr);
        return reject(stderr || error.message);
      }
      resolve(stdout);
    });
  });
}

function describeNamespace(namespace) {
  return new Promise((resolve, reject) => {
    const { exec } = require("child_process");
    const cmd = `kubectl describe namespace ${namespace}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("kubectl describe namespace error:", stderr);
        return reject(stderr || error.message);
      }
      resolve(stdout);
    });
  });
}

function describeDeployment(deploymentName, namespace = "default") {
  return new Promise((resolve, reject) => {
    const { exec } = require("child_process");
    const cmd = `kubectl describe deployment ${deploymentName} -n ${namespace}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("kubectl describe deployment error:", stderr);
        return reject(stderr || error.message);
      }
      resolve(stdout);
    });
  });
}

/* =====================================================
   TROUBLESHOOT TOOL EXECUTION
===================================================== */

// Hard cap: kill the child process if it runs longer than this
const EXEC_TIMEOUT_MS = 60_000;

async function runTroubleshootTool(namespace, command, signal) {

  await ensureDebugPod(namespace);

  // Wrap the command in sh -c so it runs as a proper shell command
  const safeCmd = command.replace(/"/g, '\\"');
  const execCmd = `kubectl exec debug-shell -n ${namespace} -- sh -c "${safeCmd}"`;

  console.log("EXEC CMD:", execCmd);

  return new Promise((resolve) => {
    let settled = false;

    const child = exec(execCmd, { timeout: EXEC_TIMEOUT_MS }, (error, stdout, stderr) => {
      if (settled) return;
      settled = true;

      if (error) {
        if (error.killed || error.signal) {
          return resolve("⚠ Command was stopped (timeout or cancelled).");
        }
        return resolve(stderr || error.message);
      }

      resolve(stdout || stderr || "(no output)");
    });

    // Abort when the HTTP client disconnects or frontend cancels
    if (signal) {
      signal.addEventListener("abort", () => {
        if (settled) return;
        settled = true;
        try { child.kill("SIGTERM"); } catch {}
        resolve("⚠ Command cancelled by user.");
      }, { once: true });
    }
  });
}
/* =====================================================
   GENERIC COMMAND EXECUTION ON ANY POD
===================================================== */

function executeCommand(podName, namespace, command) {
  return new Promise((resolve, reject) => {

    const execCmd = `kubectl exec ${podName} -n ${namespace} -- sh -c "${command}"`;

    exec(execCmd, (error, stdout, stderr) => {

      if (error) {
        return resolve(stderr || error.message);
      }

      resolve(stdout || stderr || "No output");

    });

  });
}

/* =====================================================
   EXPORTS
===================================================== */
module.exports = {
  getPods,
  getPodMetrics,
  getPodLogs,
  getPodEvents,
  getNamespaces,
  getJobs,
  getCronJobs,
  describeJob,
  describeCronJob,
  describePod,
  describeNamespace,
  describeDeployment,
  runTroubleshootTool,
  getDebugPodStatus,
  executeCommand
};