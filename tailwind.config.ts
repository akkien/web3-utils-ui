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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        quick: ["Quicksand", "sans-serif"],
        handlee: ["Handlee", "cursive"],
      },
      boxShadow: {
        nav: "rgba(22, 25, 28, 0.2) 0px 15px 15px -10px",
      },
    },
  },
  plugins: [],
};
export default config;
