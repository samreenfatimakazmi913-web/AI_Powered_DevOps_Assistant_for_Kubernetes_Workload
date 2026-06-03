const { exec } = require("child_process");

// ===============================
// FETCH LOGS FROM KUBERNETES
// ===============================
function getLogs(podName, namespace = "default") {
  return new Promise((resolve, reject) => {
    const cmd = `kubectl logs ${podName} -n ${namespace}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(stderr || "Failed to fetch logs");
      }
      resolve(stdout);
    });
  });
}

// ===============================
// ANALYZE LOGS
// ===============================
function analyzeLogs(rawLogs) {
  const lines = rawLogs.split("\n");

  return lines.map(line => {
    const lower = line.toLowerCase();

    let type = "INFO";

    if (lower.includes("error") || lower.includes("failed")) {
      type = "ERROR";
    } else if (lower.includes("warn") || lower.includes("timeout")) {
      type = "WARNING";
    }

    return { line, type };
  });
}

// ===============================
// GENERATE INSIGHT
// ===============================
function generateInsight(analyzed) {
  const errors = analyzed.filter(l => l.type === "ERROR").length;
  const warnings = analyzed.filter(l => l.type === "WARNING").length;

  let reply = "📊 Log Summary:\n\n";

  if (errors > 0) {
    reply += `❌ ${errors} error(s) detected\n`;
    reply += `→ Possible crashes or failures\n\n`;
  }

  if (warnings > 0) {
    reply += `⚠️ ${warnings} warning(s)\n`;
    reply += `→ Possible performance issues\n\n`;
  }

  if (errors === 0 && warnings === 0) {
    reply += `✅ Logs look healthy\n\n`;
  }

  return reply;
}

// ===============================
// MAIN HANDLER
// ===============================
async function handleLogs(intent) {
  if (!intent.name) {
    return {
      reply: "Please specify a pod name to fetch logs.",
      type: "text"
    };
  }

  try {
    const rawLogs = await getLogs(intent.name, intent.namespace);

    const analyzed = analyzeLogs(rawLogs);
    const insight = generateInsight(analyzed);

    return {
      reply: insight,
      type: "logs",
      data: rawLogs
    };

  } catch (err) {
    return {
      reply: "Failed to fetch logs.",
      type: "text"
    };
  }
}

module.exports = { handleLogs };