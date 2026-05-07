import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/renderer/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        background: "#07080c",
        surface: "#0d0f16",
        panel: "#11141d",
        border: "#242938",
        muted: "#8b93a7",
        accent: "#8b5cf6",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(139,92,246,.18), 0 24px 80px rgba(0,0,0,.45)"
      }
    }
  },
  plugins: []
} satisfies Config;
