/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eefbf3",
          100: "#d6f5e1",
          200: "#aeebc8",
          300: "#7adba9",
          400: "#48c489",
          500: "#26a76d",
          600: "#178658",
          700: "#136a48",
          800: "#12543b",
          900: "#104531",
          950: "#07271b",
        },
        gold: {
          50: "#fdf8ec",
          100: "#f9edc9",
          200: "#f3da97",
          300: "#ecc15c",
          400: "#e6ab32",
          500: "#d8901f",
          600: "#bb6f18",
          700: "#965017",
          800: "#7b4118",
          900: "#673718",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};