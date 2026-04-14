require("dotenv").config();
const fetch = require("node-fetch");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// ─────────────────────────────────────────────────────────────────────────────
// Intent parser — converts free-text query into structured JSON
// ─────────────────────────────────────────────────────────────────────────────
async function analyzePrompt(prompt) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are a Kubernetes DevOps AI assistant.

Your ONLY job is to convert user queries into structured JSON intent.

⚠️ DO NOT explain anything.
⚠️ DO NOT add text.
⚠️ RETURN JSON ONLY.

==============================
1. SUPPORTED RESOURCES
==============================
pods, namespaces, jobs, cronjobs, deployments, services

==============================
2. SUPPORTED ACTIONS
==============================
list     → show resources
describe → detailed info
health   → find issues
fix      → remediation advice for a previously found issue (vague follow-ups: "how to fix", "what should I do", "help me fix this")

==============================
3. SUPPORTED FILTERS
==============================
running, failed, pending, successful, unhealthy, nodeport, loadbalancer

==============================
4. DEFINITIONS
==============================
running = Running
successful = Succeeded
failed = Failed
pending = Pending
unhealthy = Failed OR Pending OR NotReady OR Waiting

==============================
5. INTENT RULES
==============================

--- PODS ---
"show pods" → list
"failed pods" → filter=failed
"running pods" → filter=running
"unhealthy pods" → filter=unhealthy
"pods not running" → filter=unhealthy

--- JOBS ---
"failed jobs" → filter=failed
"completed jobs" → filter=successful

--- CRONJOBS ---
"show cronjobs" → list
⚠️ cronjobs do NOT have success/failure
If user says "failed cronjobs" → resource=jobs, filter=failed

--- DEPLOYMENTS ---
"show deployments" → list
"deployment status" → health
"unhealthy deployments" → filter=unhealthy

--- SERVICES ---
"show services" → list
"services not working" → health
"nodeport services" → filter=nodeport
"loadbalancer services" → filter=loadbalancer
"service using port 80" → port=80

--- NAMESPACES ---
"show namespaces" → list
"namespace status" → health
"does namespace X exist" → describe

--- REMEDIATION (follow-up questions, no resource needed) ---
"how can I fix it" → action=fix, resource=null
"how to fix this" → action=fix, resource=null
"what should I do" → action=fix, resource=null
"how do I resolve this" → action=fix, resource=null
"give me steps to fix" → action=fix, resource=null
"help me fix" → action=fix, resource=null
"what is the solution" → action=fix, resource=null

==============================
6. NAMESPACE RULES
==============================
- If user explicitly says namespace → use it
- If user says "all namespaces" → namespace=all
- If action = health → namespace=all
- Otherwise → namespace=default

==============================
7. OUTPUT RULES
==============================
"how many" → output=count
otherwise → output=list

==============================
8. RESPONSE FORMAT
==============================

RULES:
- Use null for any field the user did not specify.
- Do NOT copy the example values literally.
- "namespace" must be one of: null, "all", or a real namespace name the user mentioned.
- "name" must be a real resource name the user mentioned, or null if not specified.

{
  "resource": "pods",
  "action": "list",
  "name": null,
  "namespace": null,
  "filter": null,
  "port": null,
  "output": "list"
}

EXAMPLES:
- "describe api-server" → {"resource":"pods","action":"describe","name":"api-server","namespace":null,"filter":null,"port":null,"output":"list"}
- "describe the pod" → {"resource":"pods","action":"describe","name":null,"namespace":null,"filter":null,"port":null,"output":"list"}
- "how many pods in staging" → {"resource":"pods","action":"list","name":null,"namespace":"staging","filter":null,"port":null,"output":"count"}
`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error("Groq API error: " + errText);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  // Safe JSON extraction
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Invalid AI response: " + content);
  }

  const jsonString = content.substring(start, end + 1);

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    console.error("JSON PARSE ERROR:", jsonString);
    throw new Error("Failed to parse AI response");
  }

  // Sanitize: the small LLM sometimes returns template placeholder text
  // verbatim (e.g. name="<optional>", namespace="default | <name> | all").
  // Treat any value that looks like a template token or pipe-list as null/absent.
  const TEMPLATE_VALUE = /^(<[^>]*>|null|none|n\/a|optional|\w+\s*\|\s*\w+.*)$/i;
  for (const key of ["name", "namespace", "filter", "port"]) {
    if (parsed[key] !== undefined) {
      const v = String(parsed[key]).trim();
      if (!v || TEMPLATE_VALUE.test(v)) {
        parsed[key] = null;
      }
    }
  }
  // Normalise empty / template resource/action
  if (!parsed.resource || TEMPLATE_VALUE.test(String(parsed.resource))) parsed.resource = null;
  if (!parsed.action   || TEMPLATE_VALUE.test(String(parsed.action)))   parsed.action   = null;

  return parsed;
}

// ─────────────────────────────────────────────────────────────────────────────
// Remediation advisor — given prior issue context + the user's question,
// asks the LLM for specific, actionable Kubernetes fix steps.
// ─────────────────────────────────────────────────────────────────────────────
async function generateAdvice(lastIssue, question) {
  let contextBlock = "";

  if (lastIssue) {
    contextBlock = `
## Context from previous analysis
- **Pod**: ${lastIssue.podName} (namespace: ${lastIssue.namespace})
- **Error reasons**: ${lastIssue.reasons?.join(", ") || "unknown"}
- **Kubernetes events**:
\`\`\`
${lastIssue.events || "(none)"}
\`\`\`
`;
  } else {
    contextBlock = "No prior issue context is available. Please answer the question as a general Kubernetes question.";
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are a senior Kubernetes / DevOps engineer.
Given the context of a previously identified Kubernetes issue, provide clear, specific, step-by-step remediation instructions.

Rules:
- Be concise but actionable.
- Include exact kubectl commands where relevant.
- If the error is CrashLoopBackOff, always suggest checking logs with kubectl logs --previous.
- If the error is ImagePullBackOff, check image name and pull secrets.
- If the error is OOMKilled, suggest increasing memory limits.
- Format your response with numbered steps.
- Do NOT repeat the problem back — just give the fix steps.`,
        },
        {
          role: "user",
          content: `${contextBlock}\n\nUser question: ${question}`,
        }
      ],
      temperature: 0.3,
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error("Groq API error: " + errText);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Sorry, I could not generate advice at this time.";
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick keyword check — returns true if the message looks like a follow-up
// remediation question, so we can skip JSON intent parsing entirely.
// ─────────────────────────────────────────────────────────────────────────────
const FIX_PATTERNS = [
  /how\s+(can|do|to|should|would)\s+(i|we|you)?\s*(fix|resolve|repair|address|solve)/i,
  /how\s+to\s+fix/i,
  /fix\s+it/i,
  /fix\s+this/i,
  /what\s+(should|can|do)\s+(i|we)\s+do/i,
  /what('?s|\s+is)\s+the\s+(solution|fix|remedy)/i,
  /give\s+me\s+(steps|instructions)\s+to\s+fix/i,
  /help\s+me\s+fix/i,
  /steps\s+to\s+fix/i,
  /how\s+to\s+resolve/i,
  /remediat/i,
];

function isRemediationQuery(message) {
  return FIX_PATTERNS.some(p => p.test(message));
}

module.exports = { analyzePrompt, generateAdvice, isRemediationQuery };