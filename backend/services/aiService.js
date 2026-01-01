const fetch = require("node-fetch");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

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
You convert user requests into Kubernetes intents.
Respond ONLY with valid JSON.
No markdown. No explanations.

Allowed actions:
list_pods, list_jobs, list_cronjobs, list_namespaces, get_logs

JSON format:
{"action":"","namespace":"","pod":"","filter":""}
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

  if (
    !data ||
    !Array.isArray(data.choices) ||
    !data.choices[0]?.message?.content
  ) {
    throw new Error("Invalid Groq response: " + JSON.stringify(data));
  }

  const content = data.choices[0].message.content;

  const match = content.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("AI did not return JSON: " + content);
  }

  return JSON.parse(match[0]);
}

module.exports = { analyzePrompt };
