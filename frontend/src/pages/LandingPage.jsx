import React from "react";
import PublicNavbar from "../components/PublicNavbar";
import ScrollArrow from "../components/ScrollArrow";
import useScrollReveal from "../hooks/useScrollReveal";
import FeatureSlider from "../components/FeatureSlider";
import AIChatWithInput from "../components/AIChatWithInput";
import { Server, Terminal, Activity, Layers } from "lucide-react";

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
<section className="relative min-h-[100vh] pt-[72px] flex items-center overflow-hidden bg-white">

  {/* background system */}
  <div className="absolute inset-0">

    {/* base soft gray gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />

    {/* large soft gray glow (CENTER) */}
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
      w-[900px] h-[900px] rounded-full
      bg-gray-200/60 blur-[180px]"
    />

    {/* top-left subtle glow */}
    <div
      className="absolute top-0 left-0
      w-[500px] h-[500px]
      bg-gray-100/70 blur-[140px]"
    />

    {/* bottom-right subtle glow */}
    <div
      className="absolute bottom-0 right-0
      w-[500px] h-[500px]
      bg-gray-100/70 blur-[140px]"
    />

    {/* vertical grid */}
    <div
      className="absolute inset-0 opacity-[0.06]
      bg-[linear-gradient(to_right,#000_1px,transparent_1px)]
      bg-[size:72px_72px]"
    />

    {/* horizontal grid */}
    <div
      className="absolute inset-0 opacity-[0.04]
      bg-[linear-gradient(to_bottom,#000_1px,transparent_1px)]
      bg-[size:72px_72px]"
    />

    {/* top fade (no white line) */}
    <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-b from-gray-200/40 to-transparent" />
  </div>

  {/* content */}
  <div className="relative z-10 max-w-6xl mx-auto px-6 text-center space-y-10 animate-fade-up">

    <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-black">
      VIEWER
    </h1>

    <div className="w-20 h-[3px] bg-[#8B0000] mx-auto" />

    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
      Visual inspection platform for Kubernetes workloads.
      Understand pods, nodes, deployments and jobs without kubectl,
      dashboards, or DevOps friction.
    </p>

    {/* CTA */}
    <div className="flex justify-center gap-4 pt-4">
      <a
        href="/auth"
        className="
          px-8 py-3 rounded-md
          bg-[#8B0000] text-white font-medium
          shadow-[0_12px_30px_rgba(139,0,0,0.3)]
          hover:bg-[#720000] transition
        "
      >
        Log in
      </a>

      <a
        href="#features"
        className="
          px-8 py-3 rounded-md
          border border-[#8B0000] text-[#8B0000]
          hover:bg-[#8B0000] hover:text-white transition
        "
      >
        View features
      </a>
    </div>

    <div className="text-sm text-gray-500 pt-4">
      Read-only • Secure • Production-safe • Built for developers
    </div>
  </div>
</section>

      {/* ================= PROBLEM ================= */}
      <section ref={section1} className="py-28 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto text-center space-y-6 px-6 scroll-show">
          <h2 className="text-3xl font-semibold">
            Kubernetes is powerful — but overwhelming
          </h2>
          <p className="text-gray-600">
            Logs are scattered. Metrics are noisy. Understanding what’s happening
            requires multiple tools and deep CLI knowledge.
          </p>
        </div>
      </section>

      {/* ================= UNIFIED TOOLS ================= */}
      <section ref={section2} className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-12">
          <h2 className="text-3xl font-semibold">
            One interface. All your tools.
          </h2>

          <p className="text-gray-600 max-w-2xl mx-auto">
            VIEWER unifies Kubernetes inspection tools into a single visual
            experience — no context switching, no CLI overload.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              ["kubectl", Terminal, "Cluster control & queries"],
              ["Docker", Server, "Workload containers"],
              ["Prometheus", Activity, "Metrics & signals"],
              ["Grafana", Layers, "Visualization layers"],
            ].map(([name, Icon, text]) => (
              <div
                key={name}
                className="p-6 rounded-xl border border-gray-200 bg-white
                           hover:shadow-lg transition text-left"
              >
                <Icon size={28} className="text-[#8B0000] mb-4" />
                <h3 className="font-semibold mb-1">{name}</h3>
                <p className="text-sm text-gray-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      {/* ================= SLIDER ================= */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-8">
          <h2 className="text-3xl font-semibold text-center text-black">
            Everything you need is in motion
          </h2>

          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            Explore clusters visually — without CLI friction.
          </p>

          <FeatureSlider />
        </div>
      </section>


      {/* ================= AI ASSISTANT ================= */}
      <section
        ref={section3}
        className="min-h-screen flex items-center px-6 bg-white"
      >
        <div className="max-w-6xl mx-auto w-full text-center space-y-10">

          {/* TITLE */}
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold">
              Ask your cluster. Get clear answers.
            </h2>

            <p className="text-gray-600 max-w-3xl mx-auto">
              Type natural language queries and let AI explain
              what’s happening inside your Kubernetes cluster.
            </p>
          </div>

          {/* FIXED DEMO BOX */}
          <div className="flex justify-center">
            <div
              className="
          w-full max-w-xl
          h-[55vh]
          min-h-[380px]
          max-h-[520px]
          bg-white
          border border-gray-200
          rounded-2xl shadow-lg
          flex flex-col
          overflow-hidden
        "
            >
              <AIChatWithInput demoMode />
            </div>
          </div>

          <p className="text-sm text-gray-500">
            No kubectl. No log digging. Just answers.
          </p>

        </div>
      </section>

      {/* ================= CTA ================= */}
      <section ref={section5} className="py-28 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center space-y-6 px-6">
          <h2 className="text-3xl font-semibold text-black">
            Start seeing your cluster clearly
          </h2>

          <p className="text-gray-600">
            A modern, safe, read-only Kubernetes inspection tool for developers.
          </p>

          <a
            href="/auth"
            className="inline-block px-10 py-4 rounded-md bg-[#8B0000]
                 text-white hover:opacity-90 transition"
          >
            Log in to VIEWER
          </a>
        </div>
      </section>


      <ScrollArrow />
    </div>
  );
}
