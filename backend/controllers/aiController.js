const { analyzePrompt } = require("../services/aiService");
const k8s = require("@kubernetes/client-node");

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const coreApi = kc.makeApiClient(k8s.CoreV1Api);
const batchApi = kc.makeApiClient(k8s.BatchV1Api);

exports.handleAIQuery = async (req, res) => {
  try {
    const { message } = req.body;

    const intent = await analyzePrompt(message);

    switch (intent.action) {

      case "list_pods": {
        const { items } = await coreApi.listPodForAllNamespaces();

        let pods = items;

        if (intent.namespace) {
          pods = pods.filter(
            p => p.metadata.namespace === intent.namespace
          );
        }

        if (intent.filter === "failing") {
          pods = pods.filter(p =>
            p.status?.phase !== "Running"
          );
        }

        return res.json({
          reply: `Found ${pods.length} pods`,
          data: pods.map(p => ({
            name: p.metadata.name,
            namespace: p.metadata.namespace,
            status: p.status.phase
          }))
        });
      }

      case "list_namespaces": {
        const { items } = await coreApi.listPodForAllNamespaces();
        const namespaces = [...new Set(
          items.map(p => p.metadata.namespace)
        )];

        return res.json({
          reply: "Here are the namespaces",
          data: namespaces
        });
      }

      case "list_jobs": {
        const { items } = await batchApi.listJobForAllNamespaces();
        return res.json({
          reply: `Found ${items.length} jobs`,
          data: items.map(j => ({
            name: j.metadata.name,
            namespace: j.metadata.namespace,
            status: j.status
          }))
        });
      }

      case "get_logs": {
        if (!intent.namespace || !intent.pod) {
          return res.json({
            reply: "Please specify pod and namespace"
          });
        }

        const logs = await coreApi.readNamespacedPodLog(
          intent.pod,
          intent.namespace,
          undefined,
          undefined,
          undefined,
          undefined,
          200
        );

        return res.json({
          reply: `Logs for pod ${intent.pod}`,
          data: logs.body
        });
      }

      default:
        return res.json({
          reply: "Sorry, I could not understand your request."
        });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({
      reply: "AI processing failed"
    });
  }
};
