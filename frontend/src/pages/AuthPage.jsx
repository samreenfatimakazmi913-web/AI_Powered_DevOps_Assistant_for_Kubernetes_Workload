import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function AuthPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();

    // TEMP AUTH (frontend only)
    localStorage.setItem("auth", "true");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0b111b] transition-colors">
      <Card className="w-full max-w-md p-8 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {isLogin ? "Developer Login" : "Create Account"}
          </h1>

          <button
            onClick={toggleTheme}
            className="text-xl hover:scale-110 transition"
          >
            {theme === "dark" ? "🌞" : "🌙"}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <Input type="text" placeholder="Full Name" required />
          )}

          <Input type="email" placeholder="Email address" required />
          <Input type="password" placeholder="Password" required />

          <Button className="w-full mt-2">
            {isLogin ? "Login" : "Sign Up"}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-sm text-center mt-6 text-gray-600 dark:text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </div>
      </Card>
    </div>
  );
}
