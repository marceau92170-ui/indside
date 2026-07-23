/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Direction artistique "Carton rouge" — asphalte + rouge, un seul accent
        night: "#15171C", // charbon adouci (moins dur que le noir pur)
        surface: "#1F2228", // surface carte (garde le contraste avec le fond)
        chalk: "#EDE9E0", // blanc chaud (texte)
        glow: "#E12A3A", // rouge carton — CTA / actif uniquement
        grass: "#2A1417", // panel ember sombre — touche secondaire (boîtes de mise en avant)
        muted: "#93938D", // texte secondaire dérivé du fond
        line: "#2A2B2D", // séparateurs / bordures
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        condensed: ["var(--font-condensed)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};
