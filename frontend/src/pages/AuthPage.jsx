import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import FloatingInput from "../components/ui/FloatingInput";

export default function AuthPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [resetLink, setResetLink] = useState("");
const [showResetModal, setShowResetModal] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      alert("Server error");
    }
  };

  return (
    <div
      className="
        min-h-screen flex items-center justify-center px-4
        bg-gradient-to-br
        from-indigo-500/20 via-purple-500/20 to-blue-500/20
        dark:from-[#0b111b]
        dark:via-[#0f172a]
        dark:to-[#020617]
        relative overflow-hidden
      "
    >
      {/* DARK MODE GLOWS */}
      <div className="hidden dark:block absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/10 blur-3xl rounded-full" />
      <div className="hidden dark:block absolute top-40 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-3xl rounded-full" />

      {/* LOGIN CARD */}
      <Card
        className="
          relative z-10
          w-full max-w-lg
          p-10
          rounded-2xl
          shadow-2xl
          bg-white/90 dark:bg-gray-900/90
          backdrop-blur
          border border-gray-200 dark:border-gray-800
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sign in to continue to DevOps Visual Lab
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="
              p-2 rounded-md
              border border-gray-300 dark:border-gray-700
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition
            "
            title="Toggle theme"
          >
            {theme === "dark" ? "🌞" : "🌙"}
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="space-y-5"
        >
          <FloatingInput
            type="email"
            label="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <FloatingInput
            type="password"
            label="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {/* FORGOT PASSWORD */}
          <div className="text-right">
            <button
  type="button"
  className="text-sm text-blue-600 hover:underline"
  onClick={async () => {
    if (!email) {
      alert("Please enter email first");
      return;
    }

    const res = await fetch(
      "http://localhost:5000/api/auth/forgot-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      setResetLink(data.resetLink);
      setShowResetModal(true);
    } else {
      alert(data.message);
    }
  }}
>
  Forgot password?
</button>


          </div>

          <Button className="w-full h-11 text-base">
            Login
          </Button>
        </form>
      </Card>
      {showResetModal && (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md shadow-xl">
      <h2 className="text-lg font-semibold mb-2">
        Password Reset Link
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Click the button below to reset your password.
      </p>

      <a
        href={resetLink}
        className="block w-full text-center px-4 py-2 rounded-md
                   bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        Open Reset Page
      </a>

      <button
        onClick={() => setShowResetModal(false)}
        className="mt-3 w-full px-4 py-2 rounded-md border dark:border-gray-700"
      >
        Close
      </button>
    </div>
  </div>
)}

    </div>
  );
}
