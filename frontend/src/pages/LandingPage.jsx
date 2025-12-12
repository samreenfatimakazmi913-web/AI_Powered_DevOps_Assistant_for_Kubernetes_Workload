// src/pages/LandingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col overflow-hidden">

      {/* Animated Background Shapes */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[var(--k8sBlue)] opacity-20 rounded-full animate-floatSlow"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-[var(--k8sBlue)] opacity-10 rounded-full animate-float"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-[var(--k8sBlue)] opacity-15 rounded-full animate-floatSlow delay-500"></div>
      </div>

      {/* Top Navbar */}
      <nav className="w-full px-8 py-4 flex justify-between items-center bg-[var(--surface)] shadow-md relative z-10">
        <div className="text-2xl font-bold text-[var(--k8sBlue)]">DevOps Assistant</div>
        <ul className="flex gap-6 text-[var(--text)] font-medium">
          <li className="hover:text-[var(--k8sBlue)] cursor-pointer" onClick={() => window.scrollTo(0,0)}>Home</li>
          <li className="hover:text-[var(--k8sBlue)] cursor-pointer">Docs</li>
          <li className="hover:text-[var(--k8sBlue)] cursor-pointer">Contact</li>
          <li className="hover:text-[var(--k8sBlue)] cursor-pointer">About</li>
        </ul>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 relative">
        
        {/* Big Heading */}
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 animate-fadeIn">
          AI-Powered <span className="text-[var(--k8sBlue)]">DevOps Assistant</span> for Kubernetes Workloads
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-[var(--muted)] mb-10 max-w-2xl animate-fadeIn delay-200">
          Streamline your Kubernetes operations, monitor metrics, manage jobs, and interact with an intelligent AI assistant — all in one platform.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fadeIn delay-400">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-4 bg-[var(--k8sBlue)] hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition transform hover:-translate-y-1"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate("/assistant")}
            className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl shadow-lg transition transform hover:-translate-y-1"
          >
            Launch AI Assistant
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-[var(--muted)] text-sm text-center py-4 bg-[var(--surface)] z-10 relative">
        &copy; 2025 DevOps Assistant. All rights reserved.
      </footer>

      {/* Tailwind Animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-20px) translateX(10px); }
          }
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-10px) translateX(-5px); }
          }
          .animate-float { animation: float 8s ease-in-out infinite; }
          .animate-floatSlow { animation: floatSlow 12s ease-in-out infinite; }
          .animate-fadeIn { animation: fadeIn 1s ease forwards; opacity: 0; }
          @keyframes fadeIn { to { opacity: 1; } }
          .delay-200 { animation-delay: 0.2s; }
          .delay-400 { animation-delay: 0.4s; }
          .delay-500 { animation-delay: 0.5s; }
        `}
      </style>
    </div>
  );
}
