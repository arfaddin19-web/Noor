/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        noor: {
          50: "#f2faf8",
          100: "#d6f0ea",
          500: "#0e8a72",
          600: "#0b6f5c",
          700: "#095a4a",
        },
      },
    },
  },
  plugins: [],
};
