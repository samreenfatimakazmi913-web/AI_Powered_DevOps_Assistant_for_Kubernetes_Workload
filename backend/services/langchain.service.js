const { ChatGroq } = require("@langchain/groq");
const { PromptTemplate } = require("@langchain/core/prompts");

// 🔴 Direct key (temporary – dev mode)
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY ,
  model: "llama-3.1-8b-instant",
  temperature: 0,
});

const prompt = PromptTemplate.fromTemplate(`
You are an AI assistant for Kubernetes DevOps.

Convert the user query into a STRICT JSON object.

Allowed actions:
- GET_PODS
- GET_POD_LOGS
- GET_METRICS

Rules:
- Output ONLY valid JSON
- Do NOT add explanations
- Use namespace "ai-demo" if not specified
- CPU, memory, performance, health → GET_METRICS
- running, active, failed pods → GET_PODS

JSON output example:
{{
  "action": "GET_METRICS",
  "filter": "",
  "resource": "",
  "namespace": "ai-demo"
}}

User Query:
{query}
`);

async function getIntentFromAI(query) {
  const formatted = await prompt.format({ query });
  const response = await model.invoke(formatted);

  const match = response.content.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("No JSON found in Groq response");
  }

  return JSON.parse(match[0]);
}

module.exports = { getIntentFromAI };
