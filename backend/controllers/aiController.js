const { analyzePrompt, generateAdvice, isRemediationQuery } = require("../services/aiService");
const { routeIntent } = require("../services/aiRouter");

// Handlers
const { handlePods } = require("../services/handlers/pods.handler");
const { handleNamespaces } = require("../services/handlers/namespaces.handler");
const { handleJobs } = require("../services/handlers/jobs.handler");
const { handleCronJobs } = require("../services/handlers/cronjobs.handler");
const { handleDeployments } = require("../services/handlers/deployments.handler");
const { handleServices } = require("../services/handlers/services.handler");
const { handleLogs } = require("../services/handlers/logs.handler");

// lastContext persists across requests in this process.
let lastContext = {};

// ─── Clarifying question builder ──────────────────────────────────────────
// When we can't determine what the user is asking, generate a targeted
// follow-up question instead of a generic error.
function buildClarifyingQuestion(lowerMsg, ctx) {
  const isWhyWhat = /\b(why|what|explain|reason|cause|issue|problem|error)\b/.test(lowerMsg);
  const hasName   = /\b(pod|deploy|job|service)\s+[\w-]+/i.test(lowerMsg);

  if (isWhyWhat && ctx.resource === "pods") {
    return [
      "I can see you're asking about a pod issue. Could you clarify:",
      "• **Which pod** are you asking about? (e.g. \"why is `api-server` failing?\")",
      "• **Which namespace** is it in? (e.g. \"in the staging namespace\")",
    ].join("\n");
  }
  if (isWhyWhat) {
    return [
      "I'd like to help debug that. Could you tell me:",
      "• What **resource type** is having the issue? (pod, deployment, service…)",
      "• What is the **resource name**?",
      ctx.specificNamespace ? `• Should I look in namespace \`${ctx.specificNamespace}\`?` : "• Which **namespace** should I check?",
    ].join("\n");
  }
  if (ctx.resource) {
    return `Could you be more specific? I was last looking at **${ctx.resource}** — are you asking about those, or something else?`;
  }
  return [
    "I'm not sure what you're asking about. Could you specify:",
    "• The **resource type** (pods, deployments, services, jobs, namespaces)",
    "• Optionally a **resource name** or **namespace**",
    "",
    "Example: _\"show me unhealthy pods in staging\"_",
  ].join("\n");
}

// ===============================
// AI QUERY HANDLER
// ===============================
exports.handleAIQuery = async (req, res) => {
  try {
    const { message, userNamespace, userNamespaces: rawUserNs } = req.body;
    // Build the canonical list of namespaces this user is allowed to see
    const userNsList = Array.isArray(rawUserNs) && rawUserNs.length
      ? rawUserNs
      : userNamespace ? [userNamespace] : [];

    if (!message) {
      return res.status(400).json({
        reply: "No query provided.",
        type: "text"
      });
    }

    // ===============================
    // 🔧 STEP 0: EARLY REMEDIATION INTERCEPT
    // If the message is clearly a "how to fix" follow-up, skip intent parsing
    // and go straight to advice generation using stored context.
    // ===============================
    if (isRemediationQuery(message)) {
      const advice = await generateAdvice(lastContext.lastIssue || null, message);
      return res.json({ reply: advice, type: "text" });
    }

    // ===============================
    // 🧠 STEP 1: ANALYZE INTENT
    // ===============================
    const intent = await analyzePrompt(message);

    // ─── Vague follow-up detection ─────────────────────────────────────────
    // Phrases like "list down those", "show them", "how many running in X"
    // contain no explicit resource noun. Force resource=null so the context
    // fallback (lastContext.resource) fires instead.
    const lowerMsg = message.trim().toLowerCase();
    const RESOURCE_NOUNS = ["pods?","pod","deployments?","jobs?","cronjobs?","namespaces?","services?","nodes?","logs?"];
    const hasResourceNoun = new RegExp(`\\b(${RESOURCE_NOUNS.join("|")})\\b`, "i").test(lowerMsg);

    const VAGUE_STARTERS = [
      /^(list\s*(down|them|those|all|it|that))/i,
      /^(show\s*(them|those|all|me|it))/i,
      /^(display\s*(them|those|all))/i,
      /^how\s+many\s+(are\s+)?(running|pending|failed|unhealthy|healthy|active)/i,
      /^(give\s+me\s+)?(the\s+)?(list|details|info)(\s|$)/i,
    ];
    if (!hasResourceNoun && VAGUE_STARTERS.some(p => p.test(lowerMsg))) {
      intent.resource = null;
      console.log("AI VAGUE QUERY: no resource noun detected, using context fallback");
    }

    // ─── Pronoun / demonstrative name resolution ─────────────────────────
    // The LLM often extracts the literal text: "describe this deployment" →
    // name = "this deployment". Resolve these references from lastContext
    // before any handler sees the intent.
    // PRONOUN_NAME: matches "this pod", "that", "it", "the deployment", or
    // just the bare resource type word (e.g. "describe pod" → name="pod").
    const PRONOUN_NAME = /^(this|that|it|these|those|the\s+one|the\s+above|this\s+(pod|deployment|job|service|cronjob|namespace)|that\s+(pod|deployment|job|service|cronjob|namespace)|the\s+(pod|deployment|job|service|cronjob|namespace)|pod|deployment|service|job|cronjob|namespace)$/i;
    const nameIsNull    = !intent.name;
    const nameIsPronoun = intent.name && PRONOUN_NAME.test(intent.name.trim());

    // needsResolution: true when the action needs a specific name but we don't
    // have a concrete one. Restrict to "describe" and explicit-pronoun cases
    // so list / count / health queries are never incorrectly intercepted.
    const DESCRIBE_ACTIONS = ["describe", "delete", "restart", "detail", "info"];
    const needsResolution =
      nameIsPronoun ||
      (nameIsNull && DESCRIBE_ACTIONS.includes(intent.action));

    if (needsResolution) {
      const ctxNames   = lastContext.lastResultNames || [];
      // Only fall back to lastResourceName when we have no result list at all
      const singleName =
        (ctxNames.length === 1 ? ctxNames[0] : null) ||
        (!ctxNames.length ? lastContext.lastResourceName : null);

      if (singleName) {
        // One clear referent — resolve silently
        console.log(`AI: resolved '${intent.name ?? "null"}' → '${singleName}'`);
        intent.name = singleName;
      } else if (ctxNames.length > 1) {
        // Multiple candidates — always ask the user to pick
        const resource = intent.resource || lastContext.resource || "resource";
        const list = ctxNames.map(n => `\`${n}\``).join(", ");
        return res.json({
          reply: [
            `I see multiple ${resource}(s) from our last query. Which one are you referring to?`,
            `Available: ${list}`,
          ].join("\n"),
          type: "text",
        });
      } else if (nameIsPronoun) {
        // Pronoun but no context — ask for the name
        const resource = intent.resource || lastContext.resource || "resource";
        return res.json({
          reply: `I'm not sure which ${resource} you're referring to. Could you tell me the exact name?`,
          type: "text",
        });
      }
      // If nameIsNull with no context, fall through and let the handler ask
    }

    // ─── Named-resource context enrichment ────────────────────────────────
    // When the user mentions a specific pod/resource name (e.g. "why is
    // api-server failing?") the LLM often omits the namespace because it's
    // implied from the conversation. Pin to the last SPECIFIC (single)
    // namespace so we don't fan-out to all namespaces.
    if (intent.name && lastContext.specificNamespace) {
      const llmNsExplicit =
        intent.namespace &&
        intent.namespace !== "all" &&
        intent.namespace !== "default";
      if (!llmNsExplicit) {
        intent.namespace = lastContext.specificNamespace;
        console.log("AI CONTEXT: pinned namespace for named query →", intent.namespace);
      }
    }

    // Handle if LLM explicitly returns action=fix (double-safety)
    if (intent.action === "fix") {
      const advice = await generateAdvice(lastContext.lastIssue || null, message);
      return res.json({ reply: advice, type: "text" });
    }
    console.log("AI INTENT:", intent);

    // ===============================
    // 🧠 STEP 2.5: NORMALIZE INTENT
    // ===============================
    if (!intent.output) intent.output = "list";
    if (!intent.filter) intent.filter = "all";

    // ===============================
    // 🧠 STEP 3: APPLY CONTEXT (BEFORE namespace enforcement)
    // Apply context for resource AND namespace FIRST so enforcement can
    // see the fully-resolved values and make the right decision.
    // e.g. "list down those" after "deployments in kube-system" should
    // resolve to resource=deployments, namespace=kube-system BEFORE
    // enforcement checks whether to fan-out.
    // ===============================
    const isVagueQuery = !intent.resource; // was cleared by vague-detection above
    if (!intent.resource && lastContext.resource) {
      intent.resource = lastContext.resource;
      console.log("AI CONTEXT FALLBACK: resource →", intent.resource);
    }
    // For vague follow-ups, also restore the last specific namespace
    // (not the comma-separated multi-ns list) so enforcement can keep it.
    const llmNsRaw = intent.namespace;
    const llmNsEmpty = !llmNsRaw || llmNsRaw === "all" || llmNsRaw === "default";
    if (isVagueQuery && llmNsEmpty && lastContext.specificNamespace) {
      intent.namespace = lastContext.specificNamespace;
      console.log("AI CONTEXT FALLBACK: namespace →", intent.namespace);
    } else if (llmNsEmpty && lastContext.namespace) {
      intent.namespace = lastContext.namespace;
    }

    // ===============================
    // 🔒 NAMESPACE ENFORCEMENT
    // For developers (userNsList non-empty):
    //   • If the user explicitly asked for a namespace in their allowed list → use that one.
    //   • Otherwise → scope to all their allowed namespaces.
    //   • Never show data from namespaces outside their team's list.
    // For admins (empty list) → keep LLM-chosen namespace.
    // ===============================
    if (userNsList.length) {
      const ns = intent.namespace;
      const isExplicit = ns && ns !== "default" && ns !== "all";
      // A comma-separated list means "already scoped to multiple allowed ns" — keep it
      const isMulti = ns && ns.includes(",");

      if (isMulti) {
        // Already a multi-ns list from a previous step — keep as-is
      } else if (isExplicit && userNsList.includes(ns)) {
        // Allowed single namespace — honour it
        intent.namespace = ns;
      } else if (isExplicit && (intent.name || isVagueQuery)) {
        // Context-pinned namespace or named-resource query — trust it
        intent.namespace = ns;
      } else {
        // Default: scope to all allowed namespaces
        intent.namespace = userNsList.length === 1 ? userNsList[0] : userNsList.join(",");
      }
      intent.userNsList = userNsList;
    } else {
      if (!intent.namespace) intent.namespace = "all";
    }

    // ===============================
    // 🛡️ STEP 2: BASIC VALIDATION (after context fill)
    // If we still don't know what resource the user wants, ask a targeted
    // clarifying question rather than returning a generic error.
    // ===============================
    if (!intent.resource) {
      const clarifyReply = buildClarifyingQuestion(lowerMsg, lastContext);
      return res.json({ reply: clarifyReply, type: "text" });
    }

    // ===============================
    // 🌍 STEP 4: GLOBAL INTELLIGENCE (admins only)
    // Expand to cluster-wide only when the user is NOT namespace-scoped.
    // ===============================
    if (!userNsList.length) {
      const explicitNamespace =
        intent.namespace &&
        intent.namespace !== "default" &&
        intent.namespace !== "all";

      if (intent.action === "list" && intent.namespace === "default") {
        intent.namespace = "all";
      }
      if ((intent.action === "health" || intent.filter === "unhealthy") && !explicitNamespace) {
        intent.namespace = "all";
      }
      if (intent.output === "count" && !explicitNamespace) {
        intent.namespace = "all";
      }
      if (intent.resource === "services" && !explicitNamespace) {
        intent.namespace = "all";
      }
    }

    // ===============================
    // 🚦 STEP 5: ROUTING
    // ===============================
    const route = await routeIntent(intent);

    // If router returns fallback message
    if (route.reply) {
      return res.json(route);
    }

    let result;

    // ===============================
    // ⚙️ STEP 6: HANDLERS
    // ===============================

    if (route.__route === "pods") {
      result = await handlePods(intent);
    }

    if (route.__route === "namespaces") {
      result = await handleNamespaces(intent);
    }

    if (route.__route === "jobs") {
      result = await handleJobs(intent);
    }

    if (route.__route === "cronjobs") {
      result = await handleCronJobs(intent);
    }

    if (route.__route === "deployments") {
      result = await handleDeployments(intent);
    }

    if (route.__route === "services") {
      result = await handleServices(intent);
    }
if (route.__route === "logs") {
      result = await handleLogs(intent);
    }
    // ===============================
    // ❌ FALLBACK IF NO HANDLER
    // ===============================
    if (!result) {
      return res.json({
        reply: "I couldn't process your request properly.",
        type: "text"
      });
    }

    // ===============================
    // 🧠 STEP 7: SAVE CONTEXT
    // ===============================
    const isSingleNs = intent.namespace && !intent.namespace.includes(",");

    // Extract resource names from the result so pronoun references ("this",
    // "that", "it") in the next turn can be resolved automatically.
    const resultItems =
      (Array.isArray(result?.data) ? result.data : null) ||
      (Array.isArray(result?.pods) ? result.pods : null) ||
      [];
    const resultNames = resultItems.map(i => i.name).filter(Boolean);

    // If user asked about a specific named resource, that's the lastResourceName.
    // Otherwise, use the single result if there's only one.
    const derivedName =
      intent.name ||
      (resultNames.length === 1 ? resultNames[0] : lastContext.lastResourceName);

    lastContext = {
      namespace: intent.namespace,
      resource: intent.resource,
      specificNamespace: isSingleNs ? intent.namespace : lastContext.specificNamespace,
      lastResultNames: resultNames.length ? resultNames : lastContext.lastResultNames,
      lastResourceName: derivedName || lastContext.lastResourceName,
    };

    // If this was a health/unhealthy query and pods were found, store the
    // first unhealthy pod's details so a follow-up "how to fix it?" has context.
    if (
      result &&
      (intent.action === "health" || intent.filter === "unhealthy") &&
      route.__route === "pods"
    ) {
      // pods handler returns { type:"logs", data:<events text>, pods:[...] }
      const firstPod = result.pods?.[0];
      if (firstPod) {
        lastContext.lastIssue = {
          podName:   firstPod.name,
          namespace: firstPod.namespace,
          reasons:   firstPod.reasons || [],
          events:    result.data || "",
        };
      }
    }

    // ===============================
    // 📤 STEP 8: RESPONSE
    // ===============================
    return res.json(result);

  } catch (err) {
    console.error("AI CONTROLLER ERROR:", err);

    return res.status(500).json({
      reply: "AI processing failed. Please try again.",
      type: "text"
    });
  }
};