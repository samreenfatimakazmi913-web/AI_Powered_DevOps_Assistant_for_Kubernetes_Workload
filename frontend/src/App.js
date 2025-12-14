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
import AuthPage from "./pages/AuthPage";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { ThemeProvider } from "./theme/ThemeProvider";
import ProtectedRoute from "./routes/ProtectedRoute";

function Layout({ children }) {
  const location = useLocation();

  // Hide nav on landing & auth
  const hideNav =
    location.pathname === "/" || location.pathname === "/auth";

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900 dark:bg-[#0b111b] dark:text-gray-200 transition-colors duration-300">
      {!hideNav && <Sidebar />}

      <div className="flex-1 flex flex-col min-h-screen">
        {!hideNav && <Topbar />}

        <main
          className={`${
            hideNav
              ? "flex-1"
              : "flex-1 p-6 bg-gray-50 dark:bg-[#0b111b]"
          } transition-colors duration-300`}
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
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* PROTECTED ROUTES */}
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
