import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import FloatingInput from "../components/ui/FloatingInput";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const submit = async e => {
    e.preventDefault();

    const res = await fetch(
      `http://localhost:5000/api/auth/reset-password/${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      alert("Password updated successfully");
      navigate("/auth");
    } else {
      alert(data.message);
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

      <Card
  className="
    relative z-10
    w-full max-w-md
    p-8
    rounded-2xl
    shadow-2xl
    bg-white/90 dark:bg-gray-900/90
    backdrop-blur
    border border-gray-200 dark:border-gray-800
  "
>

        <h2 className="text-xl font-semibold mb-4">
          Reset Password
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <FloatingInput
            type="password"
            label="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <Button className="w-full">
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
