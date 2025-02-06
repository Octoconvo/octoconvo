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

const ibmPlexMono = localFont({
  src: [
    {
      path: "../../public/fonts/ibm-plex-mono/ibmplexmono-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/ibm-plex-mono/ibmplexmono-medium.woff",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-ibm-plex-mono",
  fallback: ["system-ui", "monospace"],
});

export { inter, ibmPlexMono };
