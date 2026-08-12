/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // "Wayfarer" palette — cream paper, charcoal ink, deep forest green,
        // sun-worn terracotta accent, warm sand surfaces, muted gold for ratings.
        cream: {
          DEFAULT: '#F6F0E4',
          50: '#FBF8F1',
          100: '#F6F0E4',
        },
        paper: '#FFFDF8',
        ink: {
          DEFAULT: '#2A2420',
          700: '#3D362F',
          500: '#6B6255',
        },
        forest: {
          DEFAULT: '#2F4A3C',
          dark: '#203327',
          light: '#4F715E',
        },
        clay: {
          DEFAULT: '#C1673B',
          dark: '#9F5330',
          light: '#E3A87C',
        },
        sand: {
          DEFAULT: '#EADFC7',
          200: '#E3D6B8',
          300: '#D8C8A2',
        },
        gold: '#BD9138',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 24px -10px rgba(42, 36, 32, 0.18)',
        card: '0 2px 10px -4px rgba(42, 36, 32, 0.10)',
      },
      backgroundImage: {
        'world-map': "url('/src/assets/world-map.svg')",
      },
      keyframes: {
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'stamp-in': {
          '0%': { opacity: 0, transform: 'scale(1.15) rotate(-8deg)' },
          '100%': { opacity: 1, transform: 'scale(1) rotate(-8deg)' },
        },
        'globe-bob': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'globe-shadow': {
          '0%, 100%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(0.9)', opacity: 0.7 },
        },
      },
      animation: {
        orbit: 'orbit 3.2s linear infinite',
        'fade-in': 'fade-in 0.4s ease-out',
        'stamp-in': 'stamp-in 0.5s ease-out',
        'globe-bob': 'globe-bob 4s ease-in-out infinite',
        'globe-shadow': 'globe-shadow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
