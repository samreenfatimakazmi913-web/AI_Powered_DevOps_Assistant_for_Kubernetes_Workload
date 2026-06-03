/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        // ===== BASE (LIGHT MODE) =====
        bg: "#F8FAFC",
        surface: "#FFFFFF",
        surfaceSoft: "#F1F5F9",
        text: "#1F2937",
        muted: "#6B7280",
        border: "#E5E7EB",

        // ===== DARK MODE (PURPLE-BASED) =====
        darkbg: "#1A1443",
        darksurface: "#221A5E",
        darksurfaceSoft: "#2A2270",
        darktext: "#E0E7FF",
        darkmuted: "#A5B4FC",
        darkborder: "#2E266D",

        // ===== BRAND (YOUR PALETTE) =====
        primary: "#281C59",
        primaryHover: "#32237A",
        primaryActive: "#1F1547",
        primarySoft: "#E0E7FF",

        secondary: "#4E8D9C",
        secondaryHover: "#3B7280",
        secondaryActive: "#2F5F6B",
        secondarySoft: "#D1FAF5",

        accent: "#85C79A",
        accentHover: "#6FB285",
        accentSoft: "#DCFCE7",

        // ===== SEMANTIC COLORS =====
        success: "#22C55E",
        successHover: "#16A34A",
        successSoft: "#DCFCE7",

        warning: "#F59E0B",
        warningHover: "#D97706",
        warningSoft: "#FEF3C7",

        danger: "#DC2626",
        dangerHover: "#B91C1C",
        dangerSoft: "#FEE2E2",

        // ===== SIDEBAR =====
        sidebar: "#281C59",
        sidebarHover: "#32237A",
        sidebarActive: "#4E8D9C",
        sidebarText: "#E0E7FF",
        sidebarMuted: "#A5B4FC",

        // ===== OPTIONAL DATA COLORS =====
        info: "#3B82F6",
        infoSoft: "#DBEAFE",

        k8sBlue: "#326CE5",
        k8sCyan: "#0EA5A8",
        k8sPurple: "#7C3AED",
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },

      boxShadow: {
        soft: "0 8px 22px rgba(0, 0, 0, 0.06)",
        medium: "0 12px 28px rgba(40, 28, 89, 0.18)",
        strong: "0 20px 48px rgba(0, 0, 0, 0.18)",
      },
    },
  },
  plugins: [],
};