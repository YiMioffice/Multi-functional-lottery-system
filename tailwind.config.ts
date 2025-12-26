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
        bauhaus: {
          red: "#E93424",
          blue: "#16508D",
          yellow: "#F4CD00",
          white: "#F9F9F5",
          black: "#1A1A1A",
        },
      },
      backgroundImage: {
        "bauhaus-pattern": "linear-gradient(45deg, #1A1A1A 25%, transparent 25%, transparent 75%, #1A1A1A 75%, #1A1A1A), linear-gradient(45deg, #1A1A1A 25%, transparent 25%, transparent 75%, #1A1A1A 75%, #1A1A1A)",
      },
      boxShadow: {
        'hard': '4px 4px 0 0 #1A1A1A',
        'hard-hover': '2px 2px 0 0 #1A1A1A',
        'hard-xl': '8px 8px 0 0 #1A1A1A',
      }
    },
  },
  plugins: [],
};
export default config;
