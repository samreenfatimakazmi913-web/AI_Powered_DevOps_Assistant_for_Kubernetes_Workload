import React from "react";
import PublicNavbar from "../components/PublicNavbar";
import CursorGlow from "../components/CursorGlow";
import ScrollArrow from "../components/ScrollArrow";

export default function AboutPage() {
  return (
    <div className="relative bg-gray-50 dark:bg-[#0b111b] text-gray-900 dark:text-gray-200 overflow-hidden">

      <CursorGlow />
      <PublicNavbar />

      {/* ================= HERO ================= */}
      <section className="relative min-h-[80vh] flex items-center justify-center px-6 text-center">

        {/* subtle background glow */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/15 blur-3xl rounded-full" />
        <div className="absolute top-32 right-0 w-[500px] h-[500px] bg-purple-500/15 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            DevOps Visual Lab
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400">
            We make DevOps and Kubernetes
            <span className="text-blue-600 font-semibold"> visible</span>.
          </p>

          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Instead of memorizing commands,
            understand how modern infrastructure actually behaves —
            visually, clearly, and in real time.
          </p>
        </div>
      </section>

      {/* ================= WHAT PROBLEM WE SOLVE ================= */}
      <section className="py-28 px-6 bg-white dark:bg-[#0f172a]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          <div className="space-y-6">
            <h2 className="text-3xl font-semibold">
              DevOps is powerful — but hard to see
            </h2>

            <p className="text-gray-600 dark:text-gray-400">
              Kubernetes clusters run silently in the background.
              Logs scroll endlessly. Metrics feel abstract.
              For learners, DevOps becomes a wall of commands.
            </p>

            <p className="text-gray-600 dark:text-gray-400">
              DevOps Visual Lab removes that barrier
              by turning live cluster data into
              dashboards, visuals, and explanations.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
            <img
              src="/dashboard-preview.png"
              alt="DevOps Visual Lab Dashboard"
            />
          </div>
        </div>
      </section>

      {/* ================= WHAT WE BUILT ================= */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <h2 className="text-3xl font-semibold">
            What is DevOps Visual Lab?
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Visual-First",
                text: "See pods, jobs, logs and metrics instead of guessing.",
              },
              {
                title: "Learning-Focused",
                text: "Built for students, labs, and DevOps beginners.",
              },
              {
                title: "AI-Assisted",
                text: "Ask questions and understand what’s happening.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]
                           border border-gray-200 dark:border-gray-800
                           hover:-translate-y-1 hover:shadow-xl transition"
              >
                <h3 className="text-xl font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-28 px-6 bg-white dark:bg-[#0f172a]">
        <div className="max-w-6xl mx-auto text-center space-y-16">

          <h2 className="text-3xl font-semibold">
            How it works
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              ["01", "Connect", "Securely connects to a Kubernetes cluster"],
              ["02", "Observe", "Fetches live workloads, logs and metrics"],
              ["03", "Understand", "Visual dashboards + AI explanations"],
            ].map(([step, title, text]) => (
              <div key={step} className="space-y-4">
                <div className="text-4xl font-bold text-blue-600">
                  {step}
                </div>
                <h3 className="text-xl font-semibold">
                  {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY IT MATTERS ================= */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-semibold">
            Why it matters
          </h2>

          <p className="text-gray-600 dark:text-gray-400">
            DevOps Visual Lab is not just a tool.
            It is a learning experience that bridges
            the gap between theory and real-world systems.
          </p>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-28 px-6 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center space-y-6 text-white">
          <h2 className="text-3xl font-semibold">
            Learn DevOps by seeing it
          </h2>

          <p className="text-blue-100">
            Built as an academic project,
            inspired by real DevOps workflows.
          </p>
        </div>
      </section>

      {/* SCROLL ARROW (UP & DOWN) */}
      <ScrollArrow />
    </div>
  );
}
