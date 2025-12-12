// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import StructuredQuerying from "./pages/StructuredQuerying";
import Nodes from "./pages/Nodes";
import AIAssistant from "./pages/AIAssistant";
import JobDetail from "./pages/JobDetail";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { ThemeProvider } from "./theme/ThemeProvider";

function Layout({ children }) {
  const location = useLocation();

  // Hide Sidebar and Topbar only on landing page
  const hideNav = location.pathname === "/";

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900 dark:bg-[#0b111b] dark:text-gray-200 transition-colors duration-300">
      {!hideNav && <Sidebar />}

      <div className="flex-1 flex flex-col min-h-screen">
        {!hideNav && <Topbar />}

        <main className={`${hideNav ? "flex-1" : "flex-1 p-6 bg-gray-50 dark:bg-[#0b111b] transition-colors duration-300"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Other pages */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/structured" element={<StructuredQuerying />} />
            <Route path="/nodes" element={<Nodes />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/job/:name" element={<JobDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
