import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/renderer/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        background: "#040816",
        surface: "#09101d",
        panel: "#0f1728",
        border: "#1f2b45",
        muted: "#94a3b8",
        accent: "#38bdf8",
        accentSoft: "#a78bfa",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        info: "#2563eb"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(56,189,248,.14), 0 24px 80px rgba(2,6,23,.52)",
        panel: "0 18px 56px rgba(2,6,23,.38)"
      }
    }
  },
  plugins: []
} satisfies Config;
