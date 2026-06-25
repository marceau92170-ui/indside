/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Premium dark palette (Linear / Vercel inspired)
        ink: {
          950: '#0a0a0b', // app background
          900: '#111113', // surface (cards, sidebar)
          850: '#18181b', // surface-2 (hover, inputs)
          800: '#1f1f23', // surface-3 (tracks, chips)
        },
        line: {
          DEFAULT: '#26262b', // borders
          strong: '#34343a', // hover borders
        },
        brand: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
        },
      },
      letterSpacing: {
        tightest: '-0.035em',
      },
      boxShadow: {
        card: '0 4px 16px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)',
        'card-lg': '0 12px 40px rgba(0,0,0,0.5)',
        glow: '0 4px 12px rgba(99,102,241,0.35)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
}
