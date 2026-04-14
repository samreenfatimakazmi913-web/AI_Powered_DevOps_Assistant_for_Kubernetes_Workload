import React, { useState } from "react";
import PodTable from "../components/ai/PodTable";
import LogViewer from "../components/ai/LogViewer";
import NamespaceTable from "../components/ai/NamespaceTable";
import JobTable from "../components/ai/JobTable";
import CronJobTable from "../components/ai/CronJobTable";
import ServiceTable from "../components/ai/ServiceTable";
import DeploymentTable from "../components/ai/DeploymentTable";
import { Copy, Check } from "lucide-react";

function getUserNamespaces() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "developer") {
      const arr = Array.isArray(user?.team?.namespaces) && user.team.namespaces.length
        ? user.team.namespaces
        : user?.team?.namespace ? [user.team.namespace] : [];
      return arr;
    }
  } catch {}
  return [];
}

/* ─── Copy button with transient "Copied!" feedback ─── */
function CopyButton({ text, small }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={copy}
      title="Copy to clipboard"
      className={`shrink-0 flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition
        ${copied
          ? "bg-green-600 text-white"
          : "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
        }`}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {!small && (copied ? "Copied!" : "Copy")}
    </button>
  );
}

/* ─── Inline code chip with copy ─── */
function InlineCode({ code }) {
  return (
    <span className="inline-flex items-center gap-1 mx-0.5 px-1.5 py-0.5 rounded bg-gray-800 text-green-300 font-mono text-xs">
      {code}
      <CopyButton text={code} small />
    </span>
  );
}

/* ─── Fenced / standalone command block with copy ─── */
function CodeBlock({ code, lang }) {
  return (
    <div className="my-2 rounded-lg overflow-hidden border border-gray-700 text-left">
      <div className="flex items-center justify-between bg-gray-800 px-3 py-1.5">
        <span className="text-xs text-gray-400 font-mono">{lang || "shell"}</span>
        <CopyButton text={code} />
      </div>
      <pre className="bg-[#0d1117] text-green-400 font-mono text-xs px-4 py-3 overflow-x-auto whitespace-pre-wrap leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

/* ─── Smart text renderer
     Handles:
       • Fenced code blocks (```..```)
       • Lines that are kubectl/helm/docker commands
       • Inline `backtick` code
       • Numbered steps and bullet points
       • Bold **text**
─── */
function renderInline(text) {
  // Handle **bold** and `inline code`
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("`") && p.endsWith("`")) {
      const code = p.slice(1, -1);
      return <InlineCode key={i} code={code} />;
    }
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    return p;
  });
}

const CMD_PREFIXES = ["kubectl ", "helm ", "docker ", "kind ", "$ kubectl ", "$ helm ", "$ docker "];
function isCommandLine(line) {
  const t = line.trim();
  return CMD_PREFIXES.some(p => t.startsWith(p));
}

function FormattedText({ text }) {
  if (!text) return null;

  // Split into fenced-code-block chunks vs plain-text chunks
  const segments = text.split(/(```[\w]*\n[\s\S]*?```)/g);

  return (
    <div className="space-y-1">
      {segments.map((seg, si) => {
        // Fenced code block
        if (seg.startsWith("```")) {
          const firstNl = seg.indexOf("\n");
          const lang = seg.slice(3, firstNl).trim() || "shell";
          const code = seg.slice(firstNl + 1).replace(/```$/, "").trim();
          return <CodeBlock key={si} code={code} lang={lang} />;
        }

        // Plain text segment — process line by line
        const lines = seg.split("\n");
        const nodes = [];
        let i = 0;

        while (i < lines.length) {
          const line = lines[i];
          const trimmed = line.trim();

          if (!trimmed) { nodes.push(<div key={`${si}-${i}`} className="h-1" />); i++; continue; }

          // Stand-alone command line → code block
          if (isCommandLine(trimmed)) {
            const cmd = trimmed.replace(/^\$\s*/, "");
            nodes.push(<CodeBlock key={`${si}-${i}`} code={cmd} />);
            i++; continue;
          }

          // Numbered step  "1. ..."
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
          if (numMatch) {
            nodes.push(
              <div key={`${si}-${i}`} className="flex gap-2 items-start">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[#6366f1] text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {numMatch[1]}
                </span>
                <span className="text-sm">{renderInline(numMatch[2])}</span>
              </div>
            );
            i++; continue;
          }

          // Bullet "- ..." or "* ..."
          const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
          if (bulletMatch) {
            nodes.push(
              <div key={`${si}-${i}`} className="flex gap-2 items-start pl-1">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-gray-400 mt-2" />
                <span className="text-sm">{renderInline(bulletMatch[1])}</span>
              </div>
            );
            i++; continue;
          }

          // Regular line
          nodes.push(
            <p key={`${si}-${i}`} className="text-sm leading-relaxed">
              {renderInline(trimmed)}
            </p>
          );
          i++;
        }

        return <div key={si} className="space-y-1.5">{nodes}</div>;
      })}
    </div>
  );
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const userNamespaces = getUserNamespaces();

  async function sendMessage() {
    if (!input.trim() || loading) return;

    // USER MESSAGE
    setMessages((prev) => [
      ...prev,
      { sender: "user", type: "text", content: input },
    ]);

    setLoading(true);

    try {
      const body = { message: input };
      if (userNamespaces.length) {
        body.userNamespaces = userNamespaces;        // full list for multi-ns scoping
        body.userNamespace  = userNamespaces[0];    // kept for backward compat
      }

      const res = await fetch("http://localhost:5000/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      // AI TEXT RESPONSE
      setMessages((prev) => [
        ...prev,
        { sender: "bot", type: "text", content: data.reply },
      ]);

      // PODS TABLE
      if (data.type === "pods" && Array.isArray(data.data)) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", type: "pods", content: data.data },
        ]);
      }
      // NAMESPACES TABLE
      if (data.type === "namespaces") {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", type: "namespaces", content: data.data },
        ]);
      }

      if (data.type === "jobs") {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", type: "jobs", content: data.data },
        ]);
      }

      if (data.type === "cronjobs") {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", type: "cronjobs", content: data.data },
        ]);
      }
      if (data.type === "deployments") {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", type: "deployments", content: data.data },
        ]);
      }
      if (data.type === "services") {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", type: "services", content: data.data },
        ]);
      }

      // LOG VIEWER
      if (typeof data.data === "string") {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", type: "logs", content: data.data },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          type: "text",
          content: "Something went wrong while processing your request.",
        },
      ]);
    }

    setLoading(false);
    setInput("");
  }

  return (
    <div className="flex flex-col h-full pt-4 md:pt-6 -mb-6">
      {/* ================= CHAT AREA ================= */}
      <div
        className="
        flex-1 overflow-y-auto p-4
        bg-gray-50 dark:bg-[#0b111b]
        rounded-xl
      "
      >
        {/* EMPTY STATE */}
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-center">
            <div className="max-w-md space-y-2">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Ask about your Kubernetes cluster
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You can ask about pods, jobs, logs, namespaces, or overall
                cluster health.
              </p>
              {userNamespaces.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {userNamespaces.map(ns => (
                    <span key={ns} className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-medium border border-indigo-100">
                      {ns}
                    </span>
                  ))}
                </div>
              )}
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
                className={`inline-block max-w-[85%] p-3 rounded-xl
                ${
                  msg.sender === "user"
                    ? "bg-gray-300 text-gray-900 text-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                }`}
              >
                {msg.sender === "user"
                  ? <span className="whitespace-pre-line text-sm">{msg.content}</span>
                  : <FormattedText text={msg.content} />
                }
              </div>
            )}

            {/* PODS TABLE */}
            {msg.type === "pods" && (
              <div className="mt-2">
                <PodTable pods={msg.content} />
              </div>
            )}
            {/* NAMESPACES TABLE */}
            {msg.type === "namespaces" && (
              <NamespaceTable namespaces={msg.content} />
            )}

            {msg.type === "jobs" && <JobTable jobs={msg.content} />}
            {msg.type === "cronjobs" && <CronJobTable cronjobs={msg.content} />}
            {msg.type === "services" && <ServiceTable services={msg.content} />}
            {msg.type === "deployments" && (
              <DeploymentTable deployments={msg.content} />
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
      <div
        className="
        p-4 flex gap-2
        border-t border-gray-200 dark:border-gray-700
        bg-white dark:bg-[#0b111b]
      "
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
