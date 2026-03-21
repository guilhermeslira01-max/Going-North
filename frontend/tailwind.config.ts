import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "nav-bg": "#003333",
        "brand-green": "#368547",
        "brand-green-hover": "#13834a",
        "brand-gold": "#c8a96e",
        "brand-bg": "#f0f4f2",
        "brand-surface": "#ffffff",
        "brand-text": "#0f2318",
        "brand-text2": "#3d5a47",
        "brand-text3": "#7a9585",
      },
      fontFamily: {
        sora: ["Sora", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
        modal: "28px",
      },
      boxShadow: {
        card: "0 2px 16px 0 rgba(15,35,24,0.08)",
        "card-hover": "0 8px 32px 0 rgba(15,35,24,0.14)",
        modal: "0 20px 60px 0 rgba(15,35,24,0.18)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        ticker: "ticker 40s linear infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        ticker: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
