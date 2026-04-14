import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "whop-bg":       "#0a0a0a",
        "whop-surface":  "#111111",
        "whop-surface2": "#1a1a1a",
        "whop-border":   "#2a2a2a",
        "whop-text":     "#f5f5f5",
        "whop-muted":    "#888888",
        "whop-faint":    "#444444",
        "whop-accent":   "#8b5cf6",
      },
    },
  },
  plugins: [],
};
export default config;
