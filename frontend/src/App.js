// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Workloads from "./pages/Workloads";
import Pods from "./pages/Pods";
import Deployments from "./pages/Deployments";
import Nodes from "./pages/Nodes";
import AIAssistant from "./pages/AIAssistant";
import JobDetail from "./pages/JobDetail";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { ThemeProvider } from "./theme/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen flex bg-gray-100 text-gray-900 dark:bg-[#0b111b] dark:text-gray-200 transition-colors duration-300">
          
          {/* Sidebar */}
          <Sidebar />

          {/* Main layout */}
          <div className="flex-1 flex flex-col min-h-screen">
            
            {/* Topbar */}
            <Topbar />

            {/* Main content */}
            <main className="flex-1 p-6 bg-gray-50 dark:bg-[#0b111b] transition-colors duration-300">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/workloads" element={<Workloads />} />
                <Route path="/pods" element={<Pods />} />
                <Route path="/deployments" element={<Deployments />} />
                <Route path="/nodes" element={<Nodes />} />
                <Route path="/assistant" element={<AIAssistant />} />
                <Route path="/job/:name" element={<JobDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
