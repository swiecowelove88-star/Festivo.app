/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '420px',
      },
      colors: {
        festivo: {
          bg: '#182022',
          dark: '#243235',
          card: '#27363A',
          border: '#3D4F52',
          teal: '#425759',
          rust: '#73321A',
          canyon: '#D97652',
          peach: '#F2AB91',
          espresso: '#401F18',
          umber: '#39201C',
          mist: '#BCC3C9',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'bounce-short': 'bounce 0.6s ease-in-out 2',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
