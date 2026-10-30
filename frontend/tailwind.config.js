/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f6f3ea",
        cream: "#fbf9f3",
        forest: { 50: "#eef4ee", 100: "#dbe8dc", 200: "#bdd3bf", 300: "#93b79a", 500: "#3f9566", 600: "#2b7a4f", 700: "#1f5e3d", 800: "#174a31", 900: "#10331f", 950: "#0a2115" },
        sage: { 100: "#e7ece2", 200: "#d3dccb", 300: "#b7c4ad", 400: "#98a98c", 500: "#6b7d60" },
        bark: { 100: "#efe6d8", 300: "#cdb894", 600: "#8a6a43", 700: "#6e5334" },
      },
      fontFamily: {
        sans: ["Instrument Sans Variable", "Instrument Sans", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        serif: ["Fraunces Variable", "Fraunces", "Georgia", "Cambria", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,51,31,0.06), 0 6px 20px rgba(16,51,31,0.06)",
        lift: "0 10px 40px rgba(10,33,21,0.18)",
      },
      keyframes: {
        fadeUp: { from: { opacity: "0", transform: "translateY(18px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slowZoom: { from: { transform: "scale(1)" }, to: { transform: "scale(1.08)" } },
      },
      animation: {
        fadeUp: "fadeUp 0.8s ease-out both",
        slowZoom: "slowZoom 24s ease-out forwards",
      },
    },
  },
  plugins: [],
};