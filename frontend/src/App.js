import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import EventsPage from "./pages/EventsPage";
import LogViewer from "./pages/LogViewer";
import WorkloadsPage from "./pages/WorkloadsPage";
import AdminDashboard from "./pages/AdminDashboard";
import TeamDetailPage from "./pages/TeamDetailPage";
import StructuredQuerying from "./pages/StructuredQuerying";
import Nodes from "./pages/Nodes";
import AIAssistant from "./pages/AIAssistant";
import JobDetail from "./pages/JobDetail";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import ResetPassword from "./pages/ResetPassword";
import AboutPage from "./pages/AboutPage";
import Documentation from "./pages/Documentation";
import DeveloperDetailPage from "./pages/DeveloperDetailPage";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer";

import ProtectedRoute from "./routes/ProtectedRoute";

import PublicLayout from "./layouts/PublicLayout";


/* ================= LAYOUT ================= */

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden flex bg-bg dark:bg-darkbg">

      {/* ── Desktop sidebar: fixed column, never scrolls ── */}
      <div className="hidden md:flex flex-col h-screen w-64 shrink-0">
        <Sidebar />
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed z-50 inset-y-0 left-0 w-64 transform
          bg-surface dark:bg-darksurface
          transition-transform md:hidden
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ── Right column: sticky topbar + scrollable content ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="shrink-0">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
        </div>
        <main className="flex-1 overflow-y-auto px-4 md:px-6 pb-6">
          {children}
        </main>
      </div>

    </div>
  );
}

/* ================= APP ================= */

export default function App() {
  return (
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
          <Route path="/docs" element={<Documentation />} />
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
            path="/workloads"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorkloadsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Layout>
                  <EventsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <Layout>
                  <LogViewer />
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
            path="/admin/teams/:teamId"
            element={
              <ProtectedRoute adminOnly>
                <Layout>
                  <TeamDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/developers/:developerId"
            element={
              <ProtectedRoute adminOnly>
                <Layout>
                  <DeveloperDetailPage />
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
   
  );
}
