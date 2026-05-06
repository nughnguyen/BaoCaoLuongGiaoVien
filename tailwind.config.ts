import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        clay: {
          base: "#e8eef7",
          pastelGreen: "#b9efcf",
          pastelOrange: "#ffd6b5",
        },
      },
      borderRadius: {
        clay: "30px",
      },
      boxShadow: {
        clay:
          "10px 10px 20px rgba(150, 170, 198, 0.45), -8px -8px 16px rgba(255, 255, 255, 0.85), inset 2px 2px 4px rgba(255,255,255,0.8)",
      },
    },
  },
  plugins: [],
};

export default config;
