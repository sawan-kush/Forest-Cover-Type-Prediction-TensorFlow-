/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f6f5ef",
        forest: { 50: "#eef4ee", 100: "#dbe8dc", 200: "#bdd3bf", 600: "#2b7a4f", 700: "#1f5e3d", 800: "#174a31", 900: "#10331f" },
        sage: { 100: "#e7ece2", 200: "#d3dccb", 300: "#b7c4ad", 400: "#98a98c", 500: "#7a8d6e" },
        bark: { 100: "#efe6d8", 300: "#cdb894", 600: "#8a6a43", 700: "#6e5334" },
      },
      fontFamily: {
        sans: ["Instrument Sans Variable", "Instrument Sans", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        serif: ["Fraunces Variable", "Fraunces", "Georgia", "Cambria", "serif"],
      },
      boxShadow: { card: "0 1px 2px rgba(16,51,31,0.06), 0 4px 14px rgba(16,51,31,0.05)" },
    },
  },
  plugins: [],
};