import React, { useState } from "react";
import PodTable from "../components/ai/PodTable";
import LogViewer from "../components/ai/LogViewer";

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    // USER MESSAGE
    setMessages(prev => [
      ...prev,
      { sender: "user", type: "text", content: input }
    ]);

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();

      // AI TEXT RESPONSE
      setMessages(prev => [
        ...prev,
        { sender: "bot", type: "text", content: data.reply }
      ]);

      // PODS TABLE
      if (Array.isArray(data.data)) {
        setMessages(prev => [
          ...prev,
          { sender: "bot", type: "pods", content: data.data }
        ]);
      }

      // LOG VIEWER
      if (typeof data.data === "string") {
        setMessages(prev => [
          ...prev,
          { sender: "bot", type: "logs", content: data.data }
        ]);
      }

    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          type: "text",
          content: "Something went wrong while processing your request."
        }
      ]);
    }

    setLoading(false);
    setInput("");
  }

  return (
    <div className="flex flex-col h-full">

      {/* ================= CHAT AREA ================= */}
      <div className="
        flex-1 overflow-y-auto p-4
        bg-gray-50 dark:bg-[#0b111b]
        rounded-xl
      ">

        {/* EMPTY STATE */}
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-center">
            <div className="max-w-md space-y-2">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Ask about your Kubernetes cluster
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You can ask about pods, jobs, logs, namespaces,
                or overall cluster health.
              </p>
            </div>
          </div>
        )}

        {/* MESSAGES */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-4 ${msg.sender === "user" ? "text-right" : ""}`}
          >

            {/* TEXT MESSAGE */}
            {msg.type === "text" && (
              <div
                className={`inline-block max-w-[85%] p-3 rounded-xl text-sm
                ${
                  msg.sender === "user"
                    ? "bg-gray-300 text-gray-900"
  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                }`}
              >
                {msg.content}
              </div>
            )}

            {/* PODS TABLE */}
            {msg.type === "pods" && (
              <div className="mt-2">
                <PodTable pods={msg.content} />
              </div>
            )}

            {/* LOG VIEWER */}
            {msg.type === "logs" && (
              <div className="mt-2">
                <LogViewer logs={msg.content} />
              </div>
            )}

          </div>
        ))}
      </div>

      {/* ================= INPUT AREA ================= */}
      <div className="
        p-4 flex gap-2
        border-t border-gray-200 dark:border-gray-700
        bg-white dark:bg-[#0b111b]
      ">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Ask about your Kubernetes cluster (pods, jobs, logs, namespaces)…"
          className="
    flex-1 p-3 rounded-xl border
    border-gray-300 dark:border-gray-700
    bg-white dark:bg-gray-900
    text-gray-900 dark:text-gray-100
    placeholder-gray-500 dark:placeholder-gray-400
    focus:outline-none
    focus:ring-1 focus:ring-gray-300
    focus:border-gray-400
  "
        />


        <button
          onClick={sendMessage}
          disabled={loading}
          className="
            px-4 py-2 rounded-xl
            bg-black text-white
            hover:bg-gray-800
            disabled:opacity-50
            transition
          "
        >
          {loading ? "..." : "➤"}
        </button>
      </div>

    </div>
  );
}
