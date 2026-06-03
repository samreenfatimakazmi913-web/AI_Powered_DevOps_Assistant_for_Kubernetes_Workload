const { getNamespaces, describeNamespace } = require("../kube.service");

// ===============================
// NAMESPACE HANDLER
// ===============================
async function handleNamespaces(intent) {

  /* ================= DESCRIBE ================= */
  if (intent.action === "describe") {
    if (!intent.name) {
      return {
        reply: "Please specify the namespace name.",
        type: "text"
      };
    }

    try {
      const output = await describeNamespace(intent.name);

      return {
        reply: `Details for namespace ${intent.name}:`,
        type: "logs",
        data: output
      };
    } catch (err) {
      return {
        reply: `Namespace '${intent.name}' not found.`,
        type: "text"
      };
    }
  }

  /* ================= FETCH ================= */
  let namespaces = [];

  try {
    const all = await getNamespaces();
    // If developer scoped, only return their allowed namespaces
    if (Array.isArray(intent.userNsList) && intent.userNsList.length) {
      namespaces = all.filter(ns => intent.userNsList.includes(ns.name));
    } else {
      namespaces = all;
    }
  } catch (err) {
    console.error("NAMESPACE FETCH ERROR:", err);
    return {
      reply: "Failed to fetch namespaces.",
      type: "text"
    };
  }

  /* ================= EXISTENCE CHECK ================= */
  if (intent.name && intent.action !== "describe") {
    const exists = namespaces.some(ns => ns.name === intent.name);

    return {
      reply: exists
        ? `Namespace '${intent.name}' exists ✅`
        : `Namespace '${intent.name}' does not exist ❌`,
      type: "text"
    };
  }

  /* ================= HEALTH ================= */
  let result = namespaces;

  if (intent.action === "health") {
    result = namespaces.filter(ns => ns.status !== "Active");
  }

  /* ================= COUNT ================= */
  if (intent.output === "count") {
    const countScope = (Array.isArray(intent.userNsList) && intent.userNsList.length)
      ? "you have access to"
      : "in the cluster";
    return {
      reply: `You have access to ${result.length} namespace(s) — ${result.map(n => n.name).join(", ")}.`,
      type: "text"
    };
  }

  /* ================= INSIGHTS ================= */
  const unhealthyCount = namespaces.filter(
    ns => ns.status !== "Active"
  ).length;

  const scopeLabel = (Array.isArray(intent.userNsList) && intent.userNsList.length)
    ? "you have access to"
    : "in the cluster";
  let reply = `Found ${result.length} namespace(s) ${scopeLabel}.\n\n`;

  if (unhealthyCount > 0) {
    reply += `⚠️ ${unhealthyCount} namespace(s) are not Active.\n`;
    reply += `This may indicate:\n`;
    reply += `• terminating namespaces\n`;
    reply += `• resource cleanup issues\n\n`;
  } else {
    reply += `All namespaces are Active ✅\n\n`;
  }

  reply += `💡 You can:\n`;
  reply += `• describe a namespace\n`;
  reply += `• check resources inside namespace\n`;

  /* ================= RETURN ================= */
  return {
    reply,
    type: "namespaces",
    data: result
  };
}

module.exports = { handleNamespaces };