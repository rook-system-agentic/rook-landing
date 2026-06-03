import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#0F0A06", card: "#1A1310", elevated: "#241C16" },
        terracota: "#E54C00",
        ocre: "#E79F4A",
        floresta: "#2E7D32",
        cream: "#F5F0EB",
        muted: "#A89A8C",
        border: "rgba(168,154,140,0.15)",
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
