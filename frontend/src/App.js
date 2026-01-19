import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StructuredQuerying from "./pages/StructuredQuerying";
import Nodes from "./pages/Nodes";
import AIAssistant from "./pages/AIAssistant";
import JobDetail from "./pages/JobDetail";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import ResetPassword from "./pages/ResetPassword";
import AboutPage from "./pages/AboutPage";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer";
import { ThemeProvider } from "./theme/ThemeProvider";
import ProtectedRoute from "./routes/ProtectedRoute";

import PublicLayout from "./layouts/PublicLayout";


/* ================= LAYOUT ================= */

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0b111b]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          className={`fixed z-50 inset-y-0 left-0 w-64 transform
            bg-white dark:bg-gray-900
            transition-transform md:hidden
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>

      
    </div>
  );
}

/* ================= APP ================= */

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>

          {/* ===== PUBLIC (NO SIDEBAR / TOPBAR) ===== */}
        <Route
  path="/"
  element={
    <PublicLayout>
      <LandingPage />
    </PublicLayout>
  }
/>

<Route
  path="/about"
  element={
    <PublicLayout>
      <AboutPage />
    </PublicLayout>
  }
/>

          <Route path="/auth" element={<AuthPage />} />
        
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ===== PROTECTED (WITH LAYOUT) ===== */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/structured"
            element={
              <ProtectedRoute>
                <Layout>
                  <StructuredQuerying />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/nodes"
            element={
              <ProtectedRoute>
                <Layout>
                  <Nodes />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assistant"
            element={
              <ProtectedRoute>
                <Layout>
                  <AIAssistant />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/job/:name"
            element={
              <ProtectedRoute>
                <Layout>
                  <JobDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
