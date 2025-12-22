import React from "react";
import PublicNavbar from "../components/PublicNavbar";
import CursorGlow from "../components/CursorGlow";
import ScrollArrow from "../components/ScrollArrow";
import useScrollReveal from "../hooks/useScrollReveal";

export default function LandingPage() {
  const section1 = useScrollReveal();
  const section2 = useScrollReveal();
  const section3 = useScrollReveal();
  const section4 = useScrollReveal();
  const section5 = useScrollReveal();
  const section6 = useScrollReveal();
  const section7 = useScrollReveal();

  return (
    <div className="relative bg-gray-50 dark:bg-[#0b111b] text-gray-900 dark:text-gray-200 overflow-hidden">

      <CursorGlow />
      <PublicNavbar />

      {/* ================= HERO ================= */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/20 blur-3xl rounded-full" />
        <div className="absolute top-32 right-0 w-[500px] h-[500px] bg-purple-500/20 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center px-6">

          <div className="space-y-8 animate-fadeUp">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              DevOps Visual Lab
              <span className="block text-blue-600">
                AI-Powered DevOps Assistant
              </span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl">
              Monitor, understand, and manage Kubernetes workloads
              using visual dashboards and AI-driven insights —
              without relying on complex CLI commands.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="/auth"
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                Get Started
              </a>

              <a
                href="#dashboard"
                className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700
                           hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                View Dashboard
              </a>
            </div>

            <p className="text-sm text-gray-500">
              Built for students • Useful for real DevOps workflows
            </p>
          </div>

          <div className="hidden md:block">
            <img
              src="/dashboard-preview.png"
              alt="Dashboard Preview"
              className="rounded-2xl shadow-2xl rotate-2"
            />
          </div>
        </div>
      </section>

      {/* ================= PROBLEM ================= */}
      <section
        ref={section1}
        className="scroll-hidden py-28 px-6 bg-white dark:bg-[#0f172a]"
      >
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-semibold">
            Kubernetes is powerful — but hard to manage
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Logs are noisy. Metrics are scattered.
            Understanding workloads often requires deep
            command-line knowledge and multiple tools.
          </p>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section
        ref={section2}
        className="scroll-hidden py-28 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-20">
            Core Platform Capabilities
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              ["Live Dashboard", "Real-time pods, jobs, deployments & namespaces"],
              ["Structured Queries", "Query cluster data without kubectl"],
              ["Live Logs", "Instant access to pod logs"],
              ["Metrics Visualization", "CPU & memory usage charts"],
              ["AI Assistant", "Ask questions and get clear answers"],
              ["Learning Focused", "Designed for labs & academic use"],
            ].map(([title, text]) => (
              <div
                key={title}
                className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]
                border border-gray-200 dark:border-gray-800
                hover:-translate-y-2 hover:shadow-2xl transition"
              >
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= AI ASSISTANT ================= */}
      <section
        ref={section3}
        className="scroll-hidden py-28 px-6 bg-white dark:bg-[#0f172a]"
      >
        <div className="max-w-6xl mx-auto text-center space-y-16">

          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">
              Ask your cluster. Get clear answers.
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              The AI assistant helps you understand Kubernetes workloads
              using simple, natural language questions —
              turning raw data into actionable insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 text-left">
            {[
              {
                q: "Why is this pod restarting?",
                a: "The pod is restarting due to memory limits being exceeded.",
              },
              {
                q: "Which workloads are using the most CPU?",
                a: "The backend deployment is currently the highest CPU consumer.",
              },
              {
                q: "Show failed jobs in this namespace",
                a: "Two jobs failed due to image pull errors.",
              },
              {
                q: "Are there any unhealthy pods?",
                a: "One pod is in CrashLoopBackOff state.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800
                           bg-gray-50 dark:bg-[#0b111b]
                           hover:shadow-xl transition"
              >
                <div className="text-sm font-semibold text-blue-600 mb-2">
                  AI Question
                </div>
                <div className="font-medium mb-3">
                  “{item.q}”
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {item.a}
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500">
            No kubectl. No log digging. Just answers.
          </p>
        </div>
      </section>

      {/* ================= DASHBOARD ================= */}
      <section
        id="dashboard"
        ref={section4}
        className="scroll-hidden py-28 px-6 bg-gray-100 dark:bg-[#0b111b]"
      >
        <div className="max-w-6xl mx-auto text-center space-y-10">
          <h2 className="text-3xl font-semibold">
            Your Kubernetes control center
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Observe workloads, analyze behavior,
            and understand issues — all in one place.
          </p>

          <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
            <img src="/dashboard-preview.png" alt="Dashboard" />
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section
        ref={section5}
        className="scroll-hidden py-28 px-6"
      >
        <div className="max-w-6xl mx-auto text-center space-y-16">
          <h2 className="text-3xl font-semibold">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              ["01", "Connect", "Securely connects to a Kubernetes cluster"],
              ["02", "Monitor", "Fetches live workloads, logs and metrics"],
              ["03", "Understand", "AI explains what’s happening"],
            ].map(([n, title, text]) => (
              <div key={n} className="space-y-4">
                <div className="text-4xl font-bold text-blue-600">{n}</div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section
        ref={section6}
        className="scroll-hidden py-28 px-6 bg-blue-600"
      >
        <div className="max-w-4xl mx-auto text-center space-y-6 text-white">
          <h2 className="text-3xl font-semibold">
            Manage Kubernetes the intelligent way
          </h2>
          <p className="text-blue-100">
            An AI-powered DevOps assistant built for learning
            and real-world understanding.
          </p>

          <a
            href="/auth"
            className="inline-block px-8 py-4 rounded-xl bg-white text-blue-600
                       font-medium hover:bg-gray-100 transition"
          >
            Start Exploring
          </a>
        </div>
      </section>
    

      <ScrollArrow />
    </div>
  );
}
