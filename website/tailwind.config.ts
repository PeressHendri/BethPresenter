import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
         background: "#0f172a",
         surface: "#1e293b",
         border: "#334155",
         accent: {
           DEFAULT: "#6366f1",
           hover: "#4f46e5",
           glow: "rgba(99, 102, 241, 0.4)"
         },
         text: {
           main: "#f8fafc",
           muted: "#94a3b8"
         }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
