import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: {
          DEFAULT: "#0B6B4F",
          deep: "#062E23",
          soft: "#E4F2EB",
        },
        canvas: "#F5F6F4",
        ink: "#111613",
        muted: "#5F6B65",
        faint: "#94A099",
        line: "#E3E7E4",
      },
      fontFamily: {
        sans: ['"Geist Variable"', "system-ui", "sans-serif"],
        display: ['"Bricolage Grotesque Variable"', '"Geist Variable"', "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};

export default config;
