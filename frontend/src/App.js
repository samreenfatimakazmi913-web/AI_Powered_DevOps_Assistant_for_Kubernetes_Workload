// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import StructuredQuerying from "./pages/StructuredQuerying";
import Nodes from "./pages/Nodes";
import AIAssistant from "./pages/AIAssistant";
import JobDetail from "./pages/JobDetail";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { ThemeProvider } from "./theme/ThemeProvider";
import ProtectedRoute from "./routes/ProtectedRoute";

function Layout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hideNav =
    location.pathname === "/" || location.pathname === "/auth";

  return (
    <div className="
  min-h-screen flex
  bg-gray-100 text-gray-900
  dark:bg-[#0b111b] dark:text-gray-200
">

      {!hideNav && (
        <>
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Mobile Sidebar */}
          <div
            className={`fixed z-50 inset-y-0 left-0 w-64 transform bg-white dark:bg-gray-900
              transition-transform md:hidden
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        {!hideNav && (
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
        )}

        <main
          className={`flex-1 ${
            hideNav ? "" : "p-4 md:p-6"
          } bg-gray-50 dark:bg-[#0b111b] transition-colors`}
        >
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
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />

            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/structured"
              element={<ProtectedRoute><StructuredQuerying /></ProtectedRoute>}
            />
            <Route
              path="/nodes"
              element={<ProtectedRoute><Nodes /></ProtectedRoute>}
            />
            <Route
              path="/assistant"
              element={<ProtectedRoute><AIAssistant /></ProtectedRoute>}
            />
            <Route
              path="/job/:name"
              element={<ProtectedRoute><JobDetail /></ProtectedRoute>}
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
