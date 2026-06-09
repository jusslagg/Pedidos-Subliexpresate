import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#112033",
          blue: "#1778b8",
          teal: "#0ea5a5",
          coral: "#ef4444",
          gold: "#f59e0b"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(17, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
