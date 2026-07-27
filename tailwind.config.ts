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
        padaeng: {
          red: "#D72638",
          "red-hover": "#B81D2D",
          "red-active": "#961523",
          "red-light": "#FDF2F3",
          white: "#FFFFFF",
          surface: "#F8F9FA",
          border: "#E9ECEF",
          text: "#1A1A1A",
          muted: "#6C757D",
        },
      },
      minHeight: {
        touch: "44px",
        btn: "48px",
      },
      minWidth: {
        touch: "44px",
      },
      borderRadius: {
        padaeng: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
