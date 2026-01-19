import React from "react";
import PublicNavbar from "../components/PublicNavbar";
import ScrollArrow from "../components/ScrollArrow";
import useScrollReveal from "../hooks/useScrollReveal";
import DashboardSlider from "../components/DashboardSlider";

export default function LandingPage() {
  const section1 = useScrollReveal();
  const section2 = useScrollReveal();
  const section3 = useScrollReveal();
  const section4 = useScrollReveal();
  const section5 = useScrollReveal();

  return (
    <div className="min-h-screen bg-white text-black overflow-hidden">
      <PublicNavbar />

      {/* ================= HERO ================= */}
      <section className="min-h-[90vh] flex items-center bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-10 animate-fade-up">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            VIEWER
          </h1>

          <div className="w-16 h-[3px] bg-[#8B0000] mx-auto" />

          <p className="text-lg text-[#7f7f7f] max-w-2xl mx-auto">
            Visual inspection tool for Kubernetes workloads. Inspect pods, nodes,
            deployments and jobs without relying on kubectl or scattered dashboards.
          </p>

          <div className="flex justify-center gap-4">
            <a
              href="/auth"
              className="px-8 py-3 rounded-md bg-[#8B0000] text-white
                         hover:opacity-90 transition"
            >
              Log in
            </a>

            <a
              href="#features"
              className="px-8 py-3 rounded-md border border-[#8B0000]
                         text-[#8B0000] hover:bg-[#8B0000] hover:text-white transition"
            >
              View features
            </a>
          </div>

          <div className="text-sm text-[#7f7f7f]">
            Read-only • Safe • Designed for developers
          </div>
        </div>
      </section>

      {/* ================= PROBLEM ================= */}
      <section ref={section1} className="py-28 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto text-center space-y-6 px-6 scroll-show">
          <h2 className="text-3xl font-semibold">
            Kubernetes is powerful — but overwhelming
          </h2>
          <p className="text-[#7f7f7f]">
            Logs are scattered. Metrics are noisy. Understanding what’s happening
            requires multiple tools and deep CLI knowledge.
          </p>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" ref={section2} className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-16">
            What VIEWER shows
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              ["Workloads", "Pods, jobs, deployments, cronjobs"],
              ["Nodes", "Node health and capacity"],
              ["Namespaces", "Logical cluster isolation"],
              ["Logs", "Live pod log inspection"],
              ["Metrics", "CPU & memory visibility"],
              ["AI Assistant", "Explain cluster state in plain text"],
            ].map(([title, text]) => (
              <div
                key={title}
                className="p-6 rounded-xl border border-[#8B0000] bg-white
                           hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-[#7f7f7f] text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= DASHBOARD SLIDER ================= */}
      <section ref={section3} className="py-28 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto text-center space-y-10 px-6">
          <h2 className="text-3xl font-semibold">
            A clear view of your cluster
          </h2>

          <p className="text-[#7f7f7f] max-w-2xl mx-auto">
            Everything you need to observe and understand your workloads —
            in one clean interface.
          </p>

          <DashboardSlider />
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section ref={section4} className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-16">
          <h2 className="text-3xl font-semibold">
            How it works
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              ["01", "Connect", "Securely connect your Kubernetes cluster"],
              ["02", "Observe", "Fetch workloads, logs and metrics"],
              ["03", "Understand", "VIEWER explains what’s happening"],
            ].map(([n, title, text]) => (
              <div key={n} className="space-y-4">
                <div className="text-4xl font-bold text-[#8B0000]">{n}</div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-[#7f7f7f]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA (UPDATED) ================= */}
      <section ref={section5} className="py-28 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto text-center space-y-6 px-6">
          <h2 className="text-3xl font-semibold">
            Start seeing your cluster clearly
          </h2>

          <p className="text-[#7f7f7f]">
            A modern, safe, read-only Kubernetes inspection tool for developers.
          </p>

          <a
            href="/auth"
            className="inline-block px-10 py-4 rounded-md
                       bg-[#8B0000] text-white hover:opacity-90 transition"
          >
            Log in to VIEWER
          </a>
        </div>
      </section>

      <ScrollArrow />
    </div>
  );
}
