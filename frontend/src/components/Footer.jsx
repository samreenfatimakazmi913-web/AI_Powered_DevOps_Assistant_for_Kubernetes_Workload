// src/components/Footer.jsx
import React from "react";
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-[#7f7f7f] border-t border-[#1f1f1f]">
      <div className="max-w-7xl mx-auto px-6 py-14">

        {/* ================= GRID ================= */}
        <div className="grid gap-10 md:grid-cols-4 items-start">

          {/* ================= BRAND ================= */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo-v.png"
                alt="VIEWER logo"
                className="w-8 h-8"
              />
              <span className="text-white font-bold text-lg">VIEWER</span>
            </div>

            <p className="text-sm leading-relaxed">
              Visual inspection platform for Kubernetes workloads.
              Observe pods, nodes, deployments and metrics without relying
              on complex CLI tools.
            </p>
          </div>

          {/* ================= PRODUCT ================= */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>Executive Dashboard</li>
              <li>Structured Querying</li>
              <li>Troubleshooting</li>
              <li>Logs</li>
              <li>Metrics</li>
              <li>AI Assistant</li>
            </ul>
          </div>

          {/* ================= TEAM ================= */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Team</h4>

            <ul className="space-y-4 text-sm">

              <li className="space-y-1">
                <span className="text-white font-medium">
                  Samreen Fatima Kazmi
                </span>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[#8B0000]" />
                  <span className="text-[#7f7f7f]">
                    bscs22f52@namal.edu.pk
                  </span>
                </div>
              </li>

              <li className="space-y-1">
                <span className="text-white font-medium">
                  Laraib Sultana
                </span>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[#8B0000]" />
                  <span className="text-[#7f7f7f]">
                    bscs22f06@namal.edu.pk
                  </span>
                </div>
              </li>

            </ul>
          </div>

          {/* ================= LOCATION ================= */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Location</h4>

            <div className="rounded-lg overflow-hidden border border-[#8B0000] shadow-sm">
              <iframe
                title="Namal University Location"
                src="https://www.google.com/maps?q=Namal+University+Mianwali&output=embed"
                className="w-full h-32"
                loading="lazy"
              />
            </div>

            <p className="mt-3 text-sm flex items-center gap-2 text-white">
              <span className="w-2 h-2 bg-[#8B0000] rounded-full" />
              Namal University, Mianwali, Pakistan
            </p>
          </div>

        </div>

        {/* ================= DIVIDER ================= */}
        <div className="my-10 border-t border-[#1f1f1f]" />

        {/* ================= BOTTOM BAR ================= */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="text-white font-medium">VIEWER</span>
          </p>

          <p>
            Built for developers • Kubernetes visibility platform
          </p>
        </div>

      </div>
    </footer>
  );
}
