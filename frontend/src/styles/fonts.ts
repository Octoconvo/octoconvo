import localFont from "next/font/local";

const inter = localFont({
  src: [
    {
      path: "../../public/fonts/inter/inter-v.woff2",
    },
    {
      path: "../../public/fonts/inter/inter-v.woff",
    },
  ],
  variable: "--font-inter",
  fallback: ["system-ui", "sans-serif"],
});

export { inter };
