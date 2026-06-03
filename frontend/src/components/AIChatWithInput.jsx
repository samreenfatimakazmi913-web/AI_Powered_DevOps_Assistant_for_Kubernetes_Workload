import React, { useEffect, useRef, useState } from "react";

const DEMO_MESSAGES = [
  {
    user: "show namespaces with active pods",
    bot: "Active pods are running in default, kube-system and dev namespaces."
  },
  {
    user: "which pod is restarting?",
    bot: "Pod auth-service-7f9c8 is restarting due to CrashLoopBackOff."
  },
  {
    user: "why is memory high?",
    bot: "High memory usage is caused by redis-cache pod exceeding limits."
  }
];

export default function AIChatWithInput() {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState("");
  const scrollRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    runDemo(0);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const runDemo = async (i) => {
    if (i >= DEMO_MESSAGES.length) {
      setTimeout(() => {
        setMessages([]);
        runDemo(0);
      }, 2500);
      return;
    }

    const text = DEMO_MESSAGES[i].user;

    for (let c = 1; c <= text.length; c++) {
      await delay(35);
      setTyping(text.slice(0, c));
    }

    await delay(400);

    setMessages(prev => [...prev, { sender: "user", text }]);
    setTyping("");

    await delay(800);

    setMessages(prev => [...prev, { sender: "bot", text: DEMO_MESSAGES[i].bot }]);

    await delay(1200);
    runDemo(i + 1);
  };

  return (
    <div className="flex justify-center h-full">
      <div className="
        w-full max-w-xl h-full
        bg-surface
        border border-border
        rounded-2xl
        shadow-medium
        flex flex-col overflow-hidden
      ">
        {/* CHAT AREA */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 text-sm"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`
                max-w-[80%] px-3 py-2 rounded-lg
                ${m.sender === "user"
                  ? "ml-auto bg-primary text-white"
                  : "bg-bg text-text border border-border"}
              `}
            >
              {m.text}
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="border-t border-border p-3 bg-surface">
          <div className="flex items-center gap-2">
            <div className="
              flex-1 px-3 py-2 rounded-md
              border border-border
              bg-bg text-muted
            ">
              {typing || "Ask something about your cluster…"}
            </div>

            <div className="
              px-4 py-2 rounded-md
              bg-primary text-white text-sm
              hover:opacity-90 transition
            ">
              Send
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* HELPERS */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}