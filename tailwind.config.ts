import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#070B14",
          900: "#0D1117",
          800: "#141B2D",
          700: "#1C2540",
          600: "#263052",
          500: "#2E3D6B",
        },
        cyan: {
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
        },
        brand: {
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
        },
        neon: {
          blue:   "#00D4FF",
          cyan:   "#00FFED",
          green:  "#39FF14",
          purple: "#A855F7",
          pink:   "#EC4899",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger:  "#EF4444",
        info:    "#6366F1",
      },

      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
        display: ["Orbitron", "Inter", "system-ui", "sans-serif"],
      },

      spacing: {
        "18":  "4.5rem",
        "88":  "22rem",
        "128": "32rem",
      },

      borderRadius: {
        "xl":  "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },

      boxShadow: {
        "glass":      "0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        "glass-lg":   "0 8px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        "neon-blue":  "0 0 20px rgba(0, 212, 255, 0.4), 0 0 60px rgba(0, 212, 255, 0.1)",
        "neon-cyan":  "0 0 20px rgba(0, 255, 237, 0.4), 0 0 60px rgba(0, 255, 237, 0.1)",
        "neon-sm":    "0 0 10px rgba(0, 212, 255, 0.3)",
        "inner-dark": "inset 0 2px 8px rgba(0, 0, 0, 0.4)",
        "hud":        "0 0 30px rgba(6, 182, 212, 0.08), inset 0 1px 0 rgba(6, 182, 212, 0.05)",
      },

      backdropBlur: {
        "xs": "4px",
      },

      backgroundImage: {
        "brand-gradient":   "linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #00FFED 100%)",
        "brand-gradient-r": "linear-gradient(270deg, #0EA5E9 0%, #06B6D4 50%, #00FFED 100%)",
        "page-bg":          "radial-gradient(ellipse at top, #141B2D 0%, #070B14 60%)",
        "card-bg":          "linear-gradient(145deg, #141B2D 0%, #0D1117 100%)",
        "hero-glow":        "radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.15) 0%, transparent 60%)",
        "wallet-card":      "linear-gradient(135deg, #0D1117 0%, #141B2D 50%, #0D1117 100%)",
        "cyber-grid":       "linear-gradient(rgba(6,182,212,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.06) 1px, transparent 1px)",
      },

      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)" },
          "50%":      { boxShadow: "0 0 40px rgba(0, 212, 255, 0.7), 0 0 80px rgba(0, 212, 255, 0.2)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "slide-in-right": {
          "0%":   { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "count-up": {
          "0%":   { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "spin-slow": {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "border-flow": {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "glitch": {
          "0%, 100%": { textShadow: "-2px 0 #ff0040, 2px 0 #00ffed", transform: "translate(0)" },
          "20%":      { textShadow: "2px 0 #ff0040, -2px 0 #00ffed" },
          "40%":      { textShadow: "-2px -1px #ff0040, 2px 1px #00ffed", transform: "translate(-1px, 1px)" },
          "60%":      { textShadow: "2px 1px #ff0040, -2px -1px #00ffed", transform: "translate(1px, -1px)" },
          "80%":      { textShadow: "-1px 2px #ff0040, 1px -2px #00ffed" },
        },
        "hud-breathe": {
          "0%, 100%": { borderColor: "rgba(6, 182, 212, 0.15)" },
          "50%":      { borderColor: "rgba(6, 182, 212, 0.35)" },
        },
      },

      animation: {
        "fade-up":        "fade-up 0.5s ease-out forwards",
        "fade-in":        "fade-in 0.3s ease-out forwards",
        "glow-pulse":     "glow-pulse 2s ease-in-out infinite",
        "shimmer":        "shimmer 2s linear infinite",
        "float":          "float 4s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out forwards",
        "spin-slow":      "spin-slow 3s linear infinite",
        "border-flow":    "border-flow 3s ease infinite",
        "glitch":         "glitch 2s ease-in-out infinite",
        "hud-breathe":    "hud-breathe 3s ease-in-out infinite",
      },

      transitionDuration: {
        "400": "400ms",
      },

      zIndex: {
        "60":  "60",
        "70":  "70",
        "80":  "80",
        "90":  "90",
        "100": "100",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
    require("@tailwindcss/typography"),
    // Clip-path utilities for cyber buttons
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".clip-cyber": {
          clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
        },
        ".clip-cyber-sm": {
          clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
        },
        ".clip-cyber-lg": {
          clipPath: "polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)",
        },
      });
    }),
  ],
};

export default config;
