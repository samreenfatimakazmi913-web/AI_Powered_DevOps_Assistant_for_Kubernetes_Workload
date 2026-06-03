import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FloatingInput from "../components/ui/FloatingInput";
import { motion } from "framer-motion";

const API = "/api";

export default function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetNotice, setResetNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        alert(text || "Login failed");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        alert(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email) {
      alert("Enter email first");
      return;
    }
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetNotice("Password reset email sent. Check your inbox.");
      } else {
        alert(data.message || "Request failed");
      }
    } catch {
      alert("Server error");
    }
  };

  return (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6 }}
    className="min-h-screen flex items-center justify-center relative overflow-hidden"
  >
    {/* 🌈 BACKGROUND */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B1F] via-[#1A1240] to-[#281C59]" />

    {/* ✨ GLOW BLOBS */}
    <motion.div
      animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-[#4E8D9C]/30 blur-[120px] rounded-full"
    />

    <motion.div
      animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-[-120px] left-[-120px] w-[400px] h-[400px] bg-[#85C79A]/20 blur-[140px] rounded-full"
    />

    {/* 💎 LOGIN CARD */}
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative z-10 w-full max-w-lg p-10 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl"
    >
      {/* HEADER */}
      <h1 className="text-4xl font-bold text-white mb-2">
        Welcome Back 👋
      </h1>
      <p className="text-gray-300 mb-8">
        Sign in to your DevOps dashboard
      </p>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* EMAIL */}
        <motion.input
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-14 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-[#4E8D9C]"
          required
        />

        {/* PASSWORD */}
        <motion.input
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-14 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-[#4E8D9C]"
          required
        />

        {/* FORGOT PASSWORD */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleForgot}
            className="text-sm text-[#85C79A] hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {/* LOGIN BUTTON */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-xl font-semibold text-white 
          bg-gradient-to-r from-[#4E8D9C] to-[#281C59] 
          hover:from-[#3B7280] hover:to-[#32237A]"
        >
          {loading ? "Authenticating..." : "Login"}
        </motion.button>
      </form>

      {/* RESET NOTICE */}
      {resetNotice && (
        <div className="mt-4 text-sm text-green-300">
          {resetNotice}
        </div>
      )}
    </motion.div>
  </motion.div>
);
}