require("dotenv").config();
const fetch = require("node-fetch");

// ✅ CORRECT GROQ API ENDPOINT
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function analyzePrompt(prompt) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      // ✅ API KEY yahan jati hai
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You convert user requests about Kubernetes PODS into structured intent JSON.

STRICT DEFINITIONS:
- successful / completed = Succeeded
- running / active = Running
- failed / failing = Failed
- pending = Pending
- unhealthy = Failed OR Pending
- all = no filter

If user asks "how many", output = "count"
Otherwise output = "list"

Respond ONLY with JSON.
No explanations. No markdown.

JSON FORMAT:
{
  "resource": "pods",
  "filter": "successful | running | failed | pending | unhealthy | all",
  "namespace": "default | <name> | all",
  "output": "list | count"
}
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

  const match = content?.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Invalid AI response: " + content);
  }

  return JSON.parse(match[0]);
}

module.exports = { analyzePrompt };
