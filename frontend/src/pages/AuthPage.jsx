import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Shield } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);

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
        from-[#eef2ff] via-[#f5f3ff] to-[#ecfeff]
        dark:from-[#0b111b]
        dark:via-[#0f172a]
        dark:to-[#020617]
      "
    >
      <Card
        className="
          w-full max-w-md
          p-8
          rounded-2xl
          shadow-xl
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-800
        "
      >
        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
            <Shield size={26} />
          </div>
        </div>

        {/* HEADER */}
        <h1 className="text-2xl font-semibold text-center">
          Sign in
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1 mb-8">
          Continue to DevOps Visual Lab
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="
                w-full h-11 px-4
                rounded-md
                bg-white dark:bg-gray-900
                border border-gray-300 dark:border-gray-700
                focus:outline-none focus:border-blue-600
              "
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="
                w-full h-11 px-4
                rounded-md
                bg-white dark:bg-gray-900
                border border-gray-300 dark:border-gray-700
                focus:outline-none focus:border-blue-600
              "
            />
          </div>

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

          {/* LOGIN */}
          <Button className="w-full h-11 text-base font-medium">
            Login
          </Button>
        </form>
      </Card>

      {/* RESET MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">
              Password Reset Link
            </h2>

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
