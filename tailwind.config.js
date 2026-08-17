/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ftm: {
          black:    "rgb(var(--ftm-black) / <alpha-value>)",
          deep:     "rgb(var(--ftm-deep) / <alpha-value>)",
          charcoal: "rgb(var(--ftm-charcoal) / <alpha-value>)",
          mid:      "rgb(var(--ftm-mid) / <alpha-value>)",
          line:     "rgb(var(--ftm-line) / <alpha-value>)",
          linelt:   "rgb(var(--ftm-linelt) / <alpha-value>)",
          white:    "rgb(var(--ftm-white) / <alpha-value>)",
          offwhite: "rgb(var(--ftm-offwhite) / <alpha-value>)",
          muted:    "var(--ftm-muted)",
          dim:      "var(--ftm-dim)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        heading: ["var(--font-heading)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      letterSpacing: { widest2: "0.25em", widest3: "0.35em" },
      animation: {
        marquee: "marquee 32s linear infinite",
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0%)" }, "100%": { transform: "translateX(-50%)" } },
        shimmer: { "0%": { backgroundPosition: "-400px 0" }, "100%": { backgroundPosition: "400px 0" } },
      },
    },
  },
  plugins: [],
};
