import React, { useState } from "react";

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  function sendMessage() {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);

    // Placeholder AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: `AI Response for: ${input}` }
      ]);
    }, 500);

    setInput("");
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="flex flex-col h-full w-full max-h-[calc(100vh-90px)]">

      {/* CHAT AREA */}
      <div className="
        flex-1 overflow-y-auto p-4 rounded-xl
        bg-white dark:bg-[#0f172a]
        border border-gray-200 dark:border-gray-800
        transition-colors
      ">

        {/* 🟢 WELCOME STATE */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              {greeting}, Samreen 👋
            </h2>

            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Ask anything about your Kubernetes cluster —  
              pods, logs, deployments, troubleshooting, or performance.
            </p>

            <div className="mt-6 text-sm text-gray-500 dark:text-gray-500">
              Try: <span className="italic">“Show failing pods in default namespace”</span>
            </div>
          </div>
        )}

        {/* 🟢 CHAT MESSAGES */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`
              w-fit max-w-[90%] sm:max-w-[75%]
              p-3 rounded-xl text-sm leading-relaxed
              whitespace-pre-wrap break-words break-all
              mb-3
              ${
                msg.sender === "user"
                  ? "ml-auto bg-k8sBlue text-white"
                  : "mr-auto bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
              }
            `}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask something about your Kubernetes cluster…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="
            flex-1 p-3 rounded-xl
            bg-white dark:bg-gray-900
            border border-gray-300 dark:border-gray-700
            text-sm text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            transition-colors
          "
        />

        <button
          onClick={sendMessage}
          className="
            px-4 py-2 rounded-xl
            bg-black text-white
            hover:bg-gray-800
            transition-colors
          "
        >
          ➤
        </button>
      </div>

    </div>
  );
}
