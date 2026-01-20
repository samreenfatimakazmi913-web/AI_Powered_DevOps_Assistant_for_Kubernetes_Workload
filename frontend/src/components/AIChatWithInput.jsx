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
  const [index, setIndex] = useState(0);

  const startedRef = useRef(false);
  const scrollRef = useRef(null);

  /* 🔒 PREVENT DOUBLE RUN (StrictMode FIX) */
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    runDemo(0);
  }, []);

  /* AUTO SCROLL */
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

    // typing animation
    for (let c = 1; c <= text.length; c++) {
      await delay(35);
      setTyping(text.slice(0, c));
    }

    await delay(400);

    setMessages(prev => [
      ...prev,
      { sender: "user", text }
    ]);
    setTyping("");

    await delay(800);

    setMessages(prev => [
      ...prev,
      { sender: "bot", text: DEMO_MESSAGES[i].bot }
    ]);

    await delay(1200);
    runDemo(i + 1);
  };

  return (
    <div className="flex justify-center h-full">
      <div
        className="
          w-full max-w-xl
          h-full
          bg-white
          border border-gray-200
          rounded-2xl
          shadow-lg
          flex flex-col
          overflow-hidden
        "
      >
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
                  ? "ml-auto bg-gray-200 text-black"
                  : "bg-[#fafafa] text-gray-700"}
              `}
            >
              {m.text}
            </div>
          ))}
        </div>

        {/* FAKE INPUT */}
        <div className="border-t border-gray-200 p-3 bg-white">
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-md border border-gray-300 text-gray-500">
              {typing || "Ask something about your cluster…"}
            </div>
            <div className="px-4 py-2 rounded-md bg-[#8B0000] text-white text-sm">
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
