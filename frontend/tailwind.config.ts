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
          2: "var(--brand-2)",
        },
        white: {
          100: "var(--white-100)",
        },
        black: {
          100: "var(--black-100)",
        },
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
    },
  },
  plugins: [],
} satisfies Config;
