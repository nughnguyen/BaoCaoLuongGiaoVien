import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2E5BFF",
          light: "#EEF2FF",
          dark: "#1E40AF",
        },
        success: {
          DEFAULT: "#059669",
          light: "#ECFDF5",
        },
        danger: {
          DEFAULT: "#E11D48",
          light: "#FFF1F2",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FFFBEB",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08)",
        sidebar: "1px 0 0 0 #E5E7EB",
      },
    },
  },
  plugins: [],
};

export default config;
