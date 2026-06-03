// backend/services/aiRouter.js

async function routeIntent(intent) {
  if (!intent || !intent.resource) {
    return {
      reply:
        "I couldn't understand your request. Please specify a resource like pods, jobs, or services.",
      type: "text",
    };
  }

  switch (intent.resource) {
    case "pods":
      return { __route: "pods" };

    case "namespaces":
      return { __route: "namespaces" };

    case "jobs":
      return { __route: "jobs" };

    case "cronjobs":
      return { __route: "cronjobs" };

    case "deployments":
      return { __route: "deployments" };

    case "services":
      return { __route: "services" };
    case "logs":
      return { __route: "logs" };

    default:
      return {
        reply: `Resource '${intent.resource}' is not supported yet.`,
        type: "text",
      };
  }
}

module.exports = { routeIntent };
