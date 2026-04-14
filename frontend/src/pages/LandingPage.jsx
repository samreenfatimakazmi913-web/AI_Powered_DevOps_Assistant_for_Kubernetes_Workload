import React from "react";
import { useNavigate } from "react-router-dom";
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
  const section5 = useScrollReveal();
  return (
    <div className="min-h-screen bg-bg text-text overflow-hidden">
      <PublicNavbar variant="dark" />

      {/* ================= HERO ================= */}
<section className="relative min-h-[100vh] pt-[72px] flex items-center overflow-hidden bg-bg">

  {/* background system */}
  <div className="absolute inset-0">

    {/* base warm gradient */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(40,28,89,0.08),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(78,141,156,0.05),transparent_22%)]" />

    {/* central brand glow */}
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
      w-[900px] h-[900px] rounded-full
      bg-primary/8 blur-[180px]"
    />

    {/* vertical grid */}
    <div
      className="absolute inset-0 opacity-[0.05]
      bg-[linear-gradient(to_right,#281C59_1px,transparent_1px)]
      bg-[size:72px_72px]"
    />

    {/* horizontal grid */}
    <div
      className="absolute inset-0 opacity-[0.03]
      bg-[linear-gradient(to_bottom,#281C59_1px,transparent_1px)]
      bg-[size:72px_72px]"
    />

  </div>

  {/* content */}
  <div className="relative z-10 max-w-6xl mx-auto px-6 text-center space-y-10 animate-fade-up">

    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface px-4 py-2 text-sm font-medium text-primary shadow-soft">
      <span className="inline-block h-2 w-2 rounded-full bg-primary" />
      Kubernetes visibility, reimagined
    </div>

    <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-text">
      VIEWER
    </h1>

    <div className="w-24 h-[4px] bg-primary mx-auto rounded-full" />

    <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed">
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
          bg-primary text-white font-medium
          shadow-medium
          hover:bg-primaryHover transition
        "
      >
        Log in
      </a>

      <a
        href="#features"
        className="
          px-8 py-3 rounded-md
          border border-border text-text bg-surface
          hover:bg-primary hover:text-white transition
        "
      >
        View features
      </a>
    </div>

    <div className="flex flex-wrap items-center justify-center gap-3 pt-3 text-sm text-muted">
      <span className="rounded-full border border-border bg-surfaceSoft px-4 py-2">Read-only</span>
      <span className="rounded-full border border-border bg-surfaceSoft px-4 py-2">Secure</span>
      <span className="rounded-full border border-border bg-surfaceSoft px-4 py-2">Production-safe</span>
      <span className="rounded-full border border-border bg-surfaceSoft px-4 py-2">Built for developers</span>
    </div>

  </div>
</section>

      {/* ================= PROBLEM ================= */}
      <section ref={section1} className="py-28 bg-primary">
        <div className="max-w-4xl mx-auto text-center space-y-6 px-6 scroll-show">
          <div className="mx-auto h-1 w-20 rounded-full bg-secondary" />
          <h2 className="text-3xl font-semibold text-darktext">
            Kubernetes is powerful — but overwhelming
          </h2>
          <p className="text-darkmuted leading-relaxed">
            Logs are scattered. Metrics are noisy. Understanding what’s happening
            requires multiple tools and deep CLI knowledge.
          </p>
        </div>
      </section>

      {/* ================= UNIFIED TOOLS ================= */}
      <section ref={section2} id="features" className="py-28 bg-surface">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-12">
          <div className="mx-auto h-1 w-20 rounded-full bg-primary" />
          <h2 className="text-3xl font-semibold text-text">
            One interface. All your tools.
          </h2>

          <p className="text-muted max-w-2xl mx-auto leading-relaxed">
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
                className="p-6 rounded-2xl border border-border bg-surface
                           hover:-translate-y-1 hover:border-primary/40 hover:shadow-medium transition text-left"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primarySoft p-3">
                  <Icon size={28} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-1 text-text">{name}</h3>
                <p className="text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      {/* ================= SLIDER ================= */}
      <section className="py-24 px-6 bg-surfaceSoft">
        <div className="max-w-6xl mx-auto space-y-8">
          <h2 className="text-3xl font-semibold text-center text-text">
            Everything you need is in motion
          </h2>

          <p className="text-center text-muted max-w-2xl mx-auto">
            Explore clusters visually — without CLI friction.
          </p>

          <FeatureSlider />
        </div>
      </section>


      {/* ================= AI ASSISTANT ================= */}
      <section
        ref={section3}
        className="min-h-screen flex items-center px-6 bg-surface"
      >
        <div className="max-w-6xl mx-auto w-full text-center space-y-10">

          {/* TITLE */}
          <div className="space-y-3">
            <div className="mx-auto h-1 w-20 rounded-full bg-primary" />
            <h2 className="text-3xl font-semibold text-text">
              Ask your cluster. Get clear answers.
            </h2>

            <p className="text-muted max-w-3xl mx-auto leading-relaxed">
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
          bg-surface
          border border-border
          rounded-2xl shadow-lg
          flex flex-col
          overflow-hidden
        "
            >
              <AIChatWithInput demoMode />
            </div>
          </div>

          <p className="text-sm text-muted">
            No kubectl. No log digging. Just answers.
          </p>

        </div>
      </section>

      {/* ================= CTA ================= */}
      <section ref={section5} className="py-28 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(78,141,156,0.20),transparent_24%)]" />
        <div className="max-w-4xl mx-auto text-center space-y-6 px-6">
          <div className="mx-auto h-1 w-20 rounded-full bg-secondary" />
          <h2 className="text-3xl font-semibold text-darktext">
            Start seeing your cluster clearly
          </h2>

          <p className="text-darkmuted">
            A modern, safe, read-only Kubernetes inspection tool for developers.
          </p>

          <a
            href="/auth"
            className="inline-block px-10 py-4 rounded-md bg-secondary text-white shadow-strong cursor-pointer transition-all duration-300 hover:bg-secondaryHover hover:-translate-y-1"
          >
            Log into Viewer
          </a>
        </div>
      </section>


      <ScrollArrow />
    </div>
  );
}