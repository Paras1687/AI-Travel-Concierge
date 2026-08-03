/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // "Journey" palette — deep ocean navy, teal route accent,
        // sky-mist surfaces, cloud white, slate text, amber only for ratings.
        navy: {
          DEFAULT: '#0B2545',
          800: '#112E52',
          900: '#081A33',
        },
        route: {
          DEFAULT: '#2EC4B6',
          light: '#7FE0D6',
          dark: '#1F9C90',
        },
        mist: {
          DEFAULT: '#EAF3F6',
          50: '#F5FAFB',
        },
        slate: {
          DEFAULT: '#5B6B7C',
        },
        amber: {
          DEFAULT: '#E7A93C',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(11, 37, 69, 0.18)',
        card: '0 4px 20px -6px rgba(11, 37, 69, 0.12)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0B2545 0%, #123A5E 45%, #1F9C90 100%)',
      },
      keyframes: {
        'route-draw': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'route-draw': 'route-draw 2.4s ease-out forwards',
        'float-slow': 'float-slow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
