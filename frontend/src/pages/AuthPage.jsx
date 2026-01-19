import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FloatingInput from "../components/ui/FloatingInput";

export default function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSubmit = async (e) => {
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
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md animate-fade-in">


        {/* CARD */}
        <div className="border border-[#7f7f7f] rounded-xl p-8 bg-white">
          {/* LOGO */}
        <div className="flex justify-center mb-10">
          <img src="/logo-v.png" alt="Viewer" className="h-10" />
        </div>
          <h1 className="text-2xl font-extrabold text-black text-center">
            Sign in to Viewer
          </h1>

          <p className="text-sm text-[#7f7f7f] text-center mt-2">
            Visual Kubernetes dashboard for developers
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <FloatingInput
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <FloatingInput
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* FORGOT PASSWORD */}
            <div className="text-right">
              <button
                type="button"
                className="
                  text-sm text-[#8B0000]
                  hover:underline
                  bg-transparent
                "
                onClick={async () => {
                  if (!email) {
                    alert("Enter email first");
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

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="
                w-full h-11 rounded-md
                bg-[#8B0000] text-white font-medium
                hover:bg-[#6f0000]
                transition
              "
            >
              Log in
            </button>
          </form>
        </div>

        <p className="text-xs text-[#7f7f7f] text-center mt-6">
          Read-only • Safe • Designed for developers
        </p>
      </div>

      {/* RESET MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md border border-[#7f7f7f]">
            <h2 className="font-semibold text-black mb-2">
              Password reset
            </h2>

            <p className="text-sm text-[#7f7f7f] mb-4">
              Click below to open reset page
            </p>

            <a
              href={resetLink}
              className="
                block text-center px-4 py-2 rounded-md
                bg-[#8B0000] text-white
                hover:bg-[#6f0000]
                transition
              "
            >
              Open reset page
            </a>

            <button
              onClick={() => setShowResetModal(false)}
              className="
                mt-3 w-full px-4 py-2 rounded-md
                border border-[#7f7f7f]
                hover:bg-gray-100
                transition
              "
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
