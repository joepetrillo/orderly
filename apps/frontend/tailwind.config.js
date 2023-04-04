/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)"],
      },
      animation: {
        "spin-fast": "spin 0.6s linear infinite",
        "pulse-fast": "pulse 0.9s cubic-bezier(0.4, 0, 0.6, 1) infinite;",
      },
    },
  },
  plugins: [],
};
