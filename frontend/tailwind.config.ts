import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
      colors: {
        brand: {
          1: "var(--brand-1)",
          "1-2": "var(--brand-1-2)",
          "1-3": "var(--brand-1-3",
          2: "var(--brand-2)",
          3: "var(--brand-3)",
          "3-d-1": "var(--brand-3-d-1)",
          4: "var(--brand-4)",
          5: "var(--brand-5)",
        },
        white: {
          100: "var(--white-100)",
          200: "var(--white-200)",
        },
        grey: {
          100: "var(--grey-100)",
          200: "var(--grey-200)",
          300: "var(--grey-300)",
        },
        black: {
          100: "var(--black-100)",
          200: "var(--black-200)",
          300: "var(--black-300)",
          400: "var(--black-400)",
          500: "var(--black-500)",
          600: "var(--black-600)",
        },
        invalid: "var(--invalid)",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontSize: {
        s: ["var(--s)", { lineHeight: "1.5" }],
        p: ["var(--p)", { lineHeight: "1.5" }],
        h6: ["var(--h6)", { lineHeight: "1.5" }],
        h5: ["var(--h5)", { lineHeight: "1.5" }],
        h4: ["var(--h4)", { lineHeight: "1.25" }],
        h3: ["var(--h3)", { lineHeight: "1.25" }],
        h2: ["var(--h2)", { lineHeight: "1.25" }],
        h1: ["var(--h1)", { lineHeight: "1.25" }],
      },
      backgroundImage: {
        "gr-1-t": "var(--gradient-1-t)",
        "gr-1-d45": "var(--gradient-1-d45)",
        "gr-2-t": "var(--gradient-2-t)",
        "gr-bg-d": "var(--gradient-bg-d)",
        "gr-brand-dark-d": "var(--gradient-brand-dark-d)",
        "gr-main-r": "var(--gradient-main-r)",
        "gr-white-100-fade-b": "var(--gradient-white-100-fade-b)",
        "gr-brand-1-3-d-1-b": "var(--gradient-brand-1-3-d-1-b)",
        "gr-black-1-b": "var(--gradient-black-1-b)",
        "gr-black-1-l": "var(--gradient-black-1-l)",
        "gr-black-2-r": "var(--gradient-black-2-r)",
        "gr-silver-b": "var(--gradient-silver-b)",
        "gr-brand-1-2-3-d-1-t": "var(--gradient-brand-1-2-3-d-1-t)",
      },
      animation: {
        "slide-right": "300ms slide-right",
        "zoom-in": "300ms zoom-in",
        "jumpy-zoom-in-s": "150ms jumpy-zoom-in-s",
      },
    },
  },
  plugins: [],
} satisfies Config;
