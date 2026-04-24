import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        paper: "#FFFFFF",
        brand: {
          DEFAULT: "#0066FF",
          soft: "#E6F0FF",
          deep: "#0047B3",
        },
        mute: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          400: "#A3A3A3",
          500: "#737373",
          700: "#404040",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(10,10,10,0.04), 0 1px 3px rgba(10,10,10,0.06)",
        lift: "0 10px 30px rgba(10,10,10,0.08)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
