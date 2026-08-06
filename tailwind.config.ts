import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "var(--color-bg)", card: "var(--color-bg-card)", elevated: "var(--color-bg-elevated)" },
        terracota: "#E54C00",
        ocre: "#E79F4A",
        floresta: "#2E7D32",
        cream: "var(--color-cream)",
        muted: "var(--color-text-muted)",
        border: "var(--color-border)",
      },
      fontFamily: {
        display: ["Manrope", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
