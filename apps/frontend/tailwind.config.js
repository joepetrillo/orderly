/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-primary)"],
        display: ["var(--font-secondary)"],
      },
      animation: {
        "spin-fast": "spin 0.5s linear infinite",
        "pulse-fast": "pulse 0.9s cubic-bezier(0.4, 0, 0.6, 1) infinite;",
      },
      minHeight: {
        dash: "calc(100vh - 80px)",
      },
    },
  },
  plugins: [],
};
