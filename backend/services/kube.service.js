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
   EXPORTS
===================================================== */
module.exports = {
  getPods,
  getPodMetrics,
  getPodLogs,
  getPodEvents
};
