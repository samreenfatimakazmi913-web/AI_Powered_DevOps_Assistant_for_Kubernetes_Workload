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
import AboutPage from "./pages/AboutPage";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer"; // ✅ FOOTER
import { ThemeProvider } from "./theme/ThemeProvider";
import ProtectedRoute from "./routes/ProtectedRoute";

function Layout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // PUBLIC pages (no sidebar/topbar)
  const hideNav =
    location.pathname === "/" ||
    location.pathname === "/auth" ||
    location.pathname === "/about";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0b111b] text-gray-900 dark:text-gray-200">

      {/* ================= APP BODY ================= */}
      <div className="flex min-h-screen">

        {!hideNav && (
          <>
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
              <Sidebar />
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/40 z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Mobile Sidebar */}
            <div
              className={`fixed z-50 inset-y-0 left-0 w-64 transform
                bg-white dark:bg-gray-900
                transition-transform md:hidden
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}

        {/* ================= MAIN CONTENT ================= */}
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

      {/* ================= FULL WIDTH FOOTER ================= */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>

            {/* -------- PUBLIC -------- */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* -------- PROTECTED -------- */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/structured"
              element={
                <ProtectedRoute>
                  <StructuredQuerying />
                </ProtectedRoute>
              }
            />

            <Route
              path="/nodes"
              element={
                <ProtectedRoute>
                  <Nodes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/assistant"
              element={
                <ProtectedRoute>
                  <AIAssistant />
                </ProtectedRoute>
              }
            />

            <Route
              path="/job/:name"
              element={
                <ProtectedRoute>
                  <JobDetail />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
