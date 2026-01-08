import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const conversations = [
  {
    q: "list all pods from all namespaces?",
    a: "Fetching pods across all namespaces. You currently have 42 running pods distributed across default, kube-system, and dev namespaces.",
  },
  {
    q: "list all failing pods?",
    a: "Two pods are failing. One pod is in CrashLoopBackOff state due to a memory limit issue, and another failed because of an image pull error.",
  },
  {
    q: "show successful pods?",
    a: "Most pods are running successfully. 38 pods are in a healthy running state across all namespaces.",
  },
  {
    q: "show namespaces with active pods",
    a: "Active pods are currently running in the default, kube-system, and dev namespaces.",
  },
];

export default function AIChatWithInput() {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [typedQ, setTypedQ] = useState("");
  const [typedA, setTypedA] = useState("");
  const [phase, setPhase] = useState("typingInput");
  // typingInput → send → thinking → typingAnswer

  const { q, a } = conversations[index];

  /* TYPE INTO INPUT */
  useEffect(() => {
    if (phase !== "typingInput") return;

    if (input.length < q.length) {
      const t = setTimeout(() => {
        setInput(q.slice(0, input.length + 1));
      }, 40);
      return () => clearTimeout(t);
    } else {
      setTimeout(() => setPhase("send"), 600);
    }
  }, [input, phase, q]);

  /* AUTO SEND */
  useEffect(() => {
    if (phase !== "send") return;

    setTypedQ(input);
    setInput("");
    setPhase("thinking");
  }, [phase, input]);

  /* THINKING → ANSWER */
  useEffect(() => {
    if (phase !== "typingAnswer") return;

    if (typedA.length < a.length) {
      const t = setTimeout(() => {
        setTypedA(a.slice(0, typedA.length + 1));
      }, 25);
      return () => clearTimeout(t);
    } else {
      setTimeout(() => {
        setTypedQ("");
        setTypedA("");
        setPhase("typingInput");
        setIndex((index + 1) % conversations.length);
      }, 2500);
    }
  }, [typedA, phase, a, index]);

  /* THINKING DELAY */
  useEffect(() => {
    if (phase === "thinking") {
      const t = setTimeout(() => setPhase("typingAnswer"), 1400);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <div className="max-w-xl mx-auto space-y-5">

      {/* CHAT AREA */}
      <div className="space-y-4">
        {typedQ && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              ml-auto bg-blue-600 text-white
              px-4 py-3 rounded-2xl rounded-br-md
              max-w-[90%]
            "
          >
            {typedQ}
          </motion.div>
        )}

        {(phase === "thinking" || typedA) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="
              bg-gray-100 dark:bg-[#0b111b]
              border border-gray-200 dark:border-gray-800
              px-4 py-3 rounded-2xl rounded-bl-md
              max-w-[90%]
            "
          >
            <div className="text-xs font-semibold text-blue-600 mb-1">
              AI Assistant
            </div>

            {phase === "thinking" && (
              <div className="flex gap-1 text-gray-500">
                <span className="animate-bounce">•</span>
                <span className="animate-bounce delay-150">•</span>
                <span className="animate-bounce delay-300">•</span>
              </div>
            )}

            {typedA && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {typedA}
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* INPUT BAR */}
      <div className="
        flex items-center gap-3
        border border-gray-300 dark:border-gray-700
        rounded-xl px-4 py-3
        bg-white dark:bg-[#0f172a]
      ">
        <input
          disabled
          value={input}
          placeholder="Ask something about your cluster..."
          className="flex-1 bg-transparent outline-none text-sm"
        />

        <button
          className={`
            px-4 py-1.5 rounded-md text-sm font-medium
            ${phase === "send" ? "bg-blue-700 text-white" : "bg-blue-600 text-white"}
          `}
        >
          Send
        </button>
      </div>
    </div>
  );
}
