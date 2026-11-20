
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          blue: "#168cff",
          cyan: "#00e5ff",
          gold: "#ffc247",
          navy: "#07111f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
