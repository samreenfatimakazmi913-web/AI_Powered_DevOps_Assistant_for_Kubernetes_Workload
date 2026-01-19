import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FloatingInput from "../components/ui/FloatingInput";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");


  const submit = async e => {
    e.preventDefault();

    try {
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
    } catch {
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">

      {/* CARD */}
      <div
        className="
          w-full max-w-md
          bg-white
          border border-black/20
          rounded-xl
          p-10
          shadow-lg
        "
      >
        {/* TITLE */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black">
            Reset Password
          </h2>

          <div className="w-14 h-[3px] bg-[#8B0000] mx-auto mt-3" />

          <p className="text-sm text-[#7f7f7f] mt-4">
            Set a new password for your VIEWER account
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={submit} className="space-y-6">
          <FloatingInput
            type="password"
            label="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {/* BUTTON */}
          <button
            type="submit"
            className="
              w-full h-11
              bg-[#8B0000]
              text-white
              rounded-md
              font-medium
              hover:opacity-90
              transition
            "
          >
            Update Password
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-center text-xs text-[#7f7f7f] mt-6">
          Secure reset • VIEWER
        </p>
      </div>
    </div>
  );
}
