/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        // Light mode
        bg: "#F9FAFB",
        surface: "#FFFFFF",
        text: "#111827",
        muted: "#6B7280",

        // Dark mode
        darkbg: "#0B1221",
        darksurface: "#111827",
        darktext: "#F3F4F6",
        darkmuted: "#9CA3AF",

        k8sBlue: "#326CE5",
        k8sCyan: "#06B6D4",
        k8sPurple: "#7C3AED",
      }
    }
  },
  plugins: []
};
