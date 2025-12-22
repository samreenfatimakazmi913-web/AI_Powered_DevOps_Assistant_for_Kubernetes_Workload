import React from "react";
import PublicNavbar from "../components/PublicNavbar";
import CursorGlow from "../components/CursorGlow";
import ScrollArrow from "../components/ScrollArrow";
import useScrollReveal from "../hooks/useScrollReveal";

export default function LandingPage() {
  const contextRef = useScrollReveal();
  const featuresRef = useScrollReveal();
  const dashboardRef = useScrollReveal();
  const stepsRef = useScrollReveal();
  const usersRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#0b111b] text-gray-900 dark:text-gray-200 overflow-hidden">

      {/* Cursor */}
      <CursorGlow />

      {/* Navbar */}
      <PublicNavbar />

      {/* ================= HERO ================= */}
      <section className="min-h-[85vh] flex items-center justify-center px-6">
        <div className="max-w-5xl text-center space-y-8 animate-fadeUp">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            AI-Powered Kubernetes{" "}
            <span className="text-blue-600">DevOps Assistant</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
            Visualize, query, and understand Kubernetes workloads using
            real-time cluster data and AI-assisted insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth"
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Get Started
            </a>

            <a
              href="/about"
              className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ================= CONTEXT ================= */}
      <section
        ref={contextRef}
        className="scroll-hidden py-20 px-6 bg-white dark:bg-[#0f172a]"
      >
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-semibold">
            Kubernetes is powerful — but hard to understand
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Logs, metrics, pods, and workloads often remain abstract concepts.
            Our platform bridges the gap between theory and real cluster behavior.
          </p>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section
        ref={featuresRef}
        className="scroll-hidden py-24 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-16">
            Core Platform Features
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              ["Executive Dashboard", "Live overview of pods, deployments, jobs & namespaces"],
              ["Structured Querying", "Guided querying of namespaces, logs & metrics"],
              ["Live Logs", "Fetch pod logs directly without kubectl"],
              ["Metrics Visualization", "CPU & memory usage via charts"],
              ["AI Assistant", "Ask natural language questions"],
              ["Learning-Focused", "Designed for academic & lab environments"],
            ].map(([title, text], i) => (
              <div
                key={title}
                style={{ transitionDelay: `${i * 120}ms` }}
                className="
                  scroll-hidden
                  p-6 rounded-xl
                  bg-white dark:bg-[#0f172a]
                  border border-gray-200 dark:border-gray-800
                  hover:-translate-y-2 hover:shadow-xl
                  transition-all
                "
              >
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= DASHBOARD PREVIEW ================= */}
      <section
        ref={dashboardRef}
        className="scroll-hidden py-24 px-6 bg-white dark:bg-[#0f172a]"
      >
        <div className="max-w-6xl mx-auto text-center space-y-10">
          <h2 className="text-3xl font-semibold">
            Real-Time Kubernetes Dashboard
          </h2>

          <p className="text-gray-600 dark:text-gray-400">
            Monitor live workloads, pods, jobs, cronjobs and cluster health.
          </p>

          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xl">
            <img
              src="/dashboard-preview.png"
              alt="Dashboard Preview"
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section
        ref={stepsRef}
        className="scroll-hidden py-24 px-6 bg-gray-100 dark:bg-[#0b111b]"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-10 text-center">
            {[
              ["01", "Connect Cluster", "Backend connects securely to Minikube"],
              ["02", "Fetch Data", "Live pods, logs, jobs & metrics"],
              ["03", "Visualize & Query", "Dashboards + AI assistance"],
            ].map(([step, title, text]) => (
              <div key={step} className="space-y-3">
                <div className="text-blue-600 font-bold text-2xl">{step}</div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= USERS ================= */}
      <section
        ref={usersRef}
        className="scroll-hidden py-24 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-16">
            Who Is This For?
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              "Computer Science Students",
              "DevOps Learners",
              "University Labs",
              "Cloud Computing Courses",
              "Kubernetes Beginners",
              "Academic Demonstrations",
            ].map((u) => (
              <div
                key={u}
                className="p-6 rounded-xl border border-gray-200 dark:border-gray-800
                           bg-white dark:bg-[#0f172a] text-center"
              >
                {u}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section
        ref={ctaRef}
        className="scroll-hidden py-24 px-6 bg-blue-600"
      >
        <div className="max-w-4xl mx-auto text-center space-y-6 text-white">
          <h2 className="text-3xl font-semibold">
            Learn Kubernetes the practical way
          </h2>
          <p className="text-blue-100">
            Academic project with real-world DevOps practices.
          </p>
          <a
            href="/auth"
            className="inline-block px-6 py-3 rounded-lg bg-white text-blue-600
                       font-medium hover:bg-gray-100 transition"
          >
            Start Exploring
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm bg-white dark:bg-[#0f172a]
        text-gray-500 dark:text-gray-400">
        © 2025 Kubernetes DevOps Assistant — Academic Project
      </footer>

      {/* Scroll arrow */}
      <ScrollArrow />
    </div>
  );
}
