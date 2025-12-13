import React from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur dark:bg-gray-900/80 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold tracking-wide">K8s DevOps Assistant</div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <NavLink to="/" className="hover:text-blue-600">Home</NavLink>
            <NavLink to="/dashboard" className="hover:text-blue-600">Dashboard</NavLink>
            <NavLink to="/structured" className="hover:text-blue-600">Structured Querying</NavLink>
            <NavLink to="/assistant" className="hover:text-blue-600">AI Assistant</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={toggleTheme}>
              {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
            </Button>
            <NavLink to="/dashboard">
              <Button>Get Started</Button>
            </NavLink>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
              Intelligent Kubernetes
              <span className="block text-blue-600">Observability & Troubleshooting</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl">
              Monitor workloads, analyze logs, troubleshoot services, and explore
              cluster metrics with a unified, executive‑grade dashboard.
            </p>
            <div className="flex flex-wrap gap-4">
              <NavLink to="/dashboard">
                <Button size="lg">Open Executive Dashboard</Button>
              </NavLink>
              <NavLink to="/structured">
                <Button size="lg" variant="outline">Structured Querying</Button>
              </NavLink>
            </div>
          </div>

          <div className="relative">
            <Card className="p-6 shadow-xl">
              <div className="text-sm font-semibold mb-3">Live Cluster Snapshot</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="text-gray-500">Clusters</div>
                  <div className="text-2xl font-bold">3</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="text-gray-500">Namespaces</div>
                  <div className="text-2xl font-bold">12</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="text-gray-500">Pods</div>
                  <div className="text-2xl font-bold">126</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="text-gray-500">Alerts</div>
                  <div className="text-2xl font-bold text-red-500">2</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Platform Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 hover:shadow-lg transition">
            <h3 className="font-semibold text-lg mb-2">Executive Dashboard</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              High‑level cluster health, workload status, and resource utilization
              at a glance.
            </p>
          </Card>
          <Card className="p-6 hover:shadow-lg transition">
            <h3 className="font-semibold text-lg mb-2">Structured Querying</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Namespace‑aware logs, service metrics, and guided troubleshooting
              workflows.
            </p>
          </Card>
          <Card className="p-6 hover:shadow-lg transition">
            <h3 className="font-semibold text-lg mb-2">AI DevOps Assistant</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Intelligent insights, root‑cause hints, and remediation guidance
              powered by AI.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t bg-gray-50 dark:bg-gray-950 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>© 2025 K8s DevOps Assistant. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-600">Docs</a>
            <a href="#" className="hover:text-blue-600">GitHub</a>
            <a href="#" className="hover:text-blue-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
