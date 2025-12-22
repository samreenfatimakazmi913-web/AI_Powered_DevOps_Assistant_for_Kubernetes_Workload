import React from "react";
import PublicNavbar from "../components/PublicNavbar";
import CursorGlow from "../components/CursorGlow";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#0b111b] overflow-hidden">
      <CursorGlow />

      {/* NAVBAR */}
      <PublicNavbar />

      {/* HERO */}
      <section className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-4xl text-center space-y-6">
          <h1
            className="
              text-4xl md:text-6xl font-bold tracking-tight
              text-gray-900 dark:text-white
              animate-fadeUp
            "
          >
            We build{" "}
            <span className="text-blue-600">intelligent</span> Kubernetes
            experiences
          </h1>

          <p
            className="
              text-lg md:text-xl
              text-gray-600 dark:text-gray-400
              animate-fadeUp delay-200
            "
          >
            A modern DevOps platform that transforms raw cluster data
            into actionable intelligence.
          </p>
        </div>
      </section>

      {/* STORY */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-[#0b111b]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
              Our Story
            </h2>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Managing Kubernetes should not feel overwhelming.
              We created this platform to help students, engineers,
              and teams understand workloads, logs, and performance
              through a clean, visual, and intelligent interface.
            </p>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              This project focuses on real-time observability,
              structured querying, and AI-assisted insights —
              bridging the gap between theory and production systems.
            </p>
          </div>

          {/* Visual / Placeholder */}
          <div
            className="
              h-64 rounded-2xl border border-dashed
              border-gray-300 dark:border-gray-700
              flex items-center justify-center
              text-gray-400
            "
          >
            Visual / Animation Area
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2
            className="
              text-3xl font-semibold text-center mb-14
              text-gray-900 dark:text-white
            "
          >
            What drives us
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Clarity",
                text: "Complex systems deserve simple interfaces.",
              },
              {
                title: "Reliability",
                text: "Real data, real insights, no assumptions.",
              },
              {
                title: "Innovation",
                text: "AI-assisted operations for modern DevOps.",
              },
            ].map((v) => (
              <div
                key={v.title}
                className="
                  p-6 rounded-xl border
                  border-gray-200 dark:border-gray-800
                  bg-white dark:bg-[#0f172a]
                  hover:-translate-y-1 transition-transform
                "
              >
                <h3
                  className="
                    text-xl font-semibold mb-2
                    text-gray-900 dark:text-white
                  "
                >
                  {v.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {v.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-semibold text-white">
            Built for learning. Ready for scale.
          </h2>

          <p className="text-blue-100">
            Designed as an academic project with real-world DevOps practices.
          </p>
        </div>
      </section>
    </div>
  );
}
