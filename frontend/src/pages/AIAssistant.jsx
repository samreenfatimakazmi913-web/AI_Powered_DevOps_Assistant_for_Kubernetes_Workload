import React, { useState } from "react";

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  function sendMessage() {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages([...messages, userMsg]);

    // Placeholder AI response (later backend connect)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `AI Response for: ${input}` }
      ]);
    }, 500);

    setInput("");
  }

  return (
    <div className="flex flex-col h-full w-full max-h-[calc(100vh-90px)]">


      {/* Chat messages window */}
      <div className="
        flex-1 overflow-y-auto p-4 space-y-4 rounded-xl
        bg-white dark:bg-[#0f172a]
        border border-gray-200 dark:border-gray-800
        transition-colors
      ">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`
              max-w-[75%] p-3 rounded-xl text-sm leading-relaxed
              ${msg.sender === "user"
                ? "ml-auto bg-k8sBlue text-white"
                : "mr-auto bg-gray-100 dark:bg-gray-800 dark:text-gray-200"
              }
            `}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Chat input box */}
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask something about your Kubernetes cluster..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="
            flex-1 p-3 rounded-xl
            bg-white dark:bg-gray-900
            border border-gray-300 dark:border-gray-700
            text-sm
            transition-colors
          "
        />
        <button
          onClick={sendMessage}
          className="
            px-4 py-2 rounded-xl bg-black text-white
            hover:bg-gray-800 transition-colors
          "
        >
          ➤
        </button>
      </div>

    </div>
  );
}
