import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, adminOnly = false }) {
  // user data localStorage se uthao
  const user = JSON.parse(localStorage.getItem("user"));

  // ❌ login hi nahi hai
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // ❌ admin page hai lekin user admin nahi
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ sab theek → page render karo
  return children;
}
