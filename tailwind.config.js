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
        // Direction artistique "Carton rouge" — asphalte + rouge, un seul accent.
        // Valeurs pilotées par variable CSS (voir globals.css) pour supporter le
        // thème clair optionnel (réglages) tout en gardant les modificateurs
        // d'opacité Tailwind (bg-glow/10, etc.) fonctionnels.
        night: "rgb(var(--color-night) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        chalk: "rgb(var(--color-chalk) / <alpha-value>)",
        glow: "rgb(var(--color-glow) / <alpha-value>)",
        grass: "rgb(var(--color-grass) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
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
