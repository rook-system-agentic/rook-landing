import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Brand colors — manual oficial */
        rook: {
          cafe: "#351F07",
          marrom: "#754A31",
          pingado: "#B07C4A",
          floresta: "#44604A",
          terracota: "#E54C00",
          "terracota-h": "#F87038",
          ocre: "#E79F4A",
          grafite: "#303030",
        },
        /* Dark surfaces */
        bg: {
          base: "#0F0A06",
          soft: "#1A130C",
          elevated: "#241A11",
          deep: "rgba(7,5,3,0.6)",
        },
        /* Cream paper (PDF demo section) */
        paper: {
          DEFAULT: "#F4ECDC",
          deep: "#E9E0CB",
          ink: "#2A1E12",
          soft: "#5A4732",
          rule: "rgba(42,30,18,0.16)",
        },
        /* Text on dark */
        fg: {
          primary: "#F5EDE0",
          secondary: "#D8CCB8",
          muted: "rgba(245,237,224,0.58)",
          subtle: "rgba(245,237,224,0.34)",
        },
        /* Rules/borders */
        rule: {
          DEFAULT: "rgba(176,124,74,0.16)",
          strong: "rgba(176,124,74,0.32)",
        },
      },
      fontFamily: {
        display: ['"Manrope"', '"Trebuchet MS"', "sans-serif"],
        body: ['"Manrope"', '"Trebuchet MS"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      maxWidth: {
        container: "1240px",
      },
      fontSize: {
        "hero-title": [
          "clamp(48px, 7.4vw, 96px)",
          { lineHeight: "0.95", letterSpacing: "-0.025em" },
        ],
        "section-title": [
          "clamp(36px, 5vw, 60px)",
          { lineHeight: "1.02", letterSpacing: "-0.02em" },
        ],
      },
      borderRadius: {
        rook: "12px",
        "rook-lg": "16px",
      },
      boxShadow: {
        mosaic: "0 18px 40px rgba(0,0,0,0.32)",
        "btn-primary": "0 4px 14px rgba(229,76,0,0.32)",
        "btn-primary-hover": "0 6px 20px rgba(229,76,0,0.42)",
      },
      animation: {
        "page-enter": "pageEnter 0.4s cubic-bezier(0.2,0.7,0.2,1) both",
        reveal: "rookReveal 0.8s cubic-bezier(0.2,0.7,0.2,1) both",
      },
      keyframes: {
        pageEnter: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        rookReveal: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
