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
        // Direction artistique "Nocturne city-stade"
        night: "#101823", // fond bleu nuit profond
        surface: "#1A2432", // surface carte
        chalk: "#F2F4F0", // blanc cassé (texte)
        glow: "#D8F34E", // jaune-vert "lumière de projecteur" — CTA / actif uniquement
        grass: "#23402E", // vert gazon sombre — touche secondaire
        muted: "#8A94A3", // texte secondaire dérivé du fond
        line: "#2A3648", // séparateurs / bordures
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
