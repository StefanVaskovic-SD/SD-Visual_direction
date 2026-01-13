/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-family)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        'custom-black': '#080808',
        'custom-white': '#f5f5f7',
        'custom-dark': {
          50: '#0a0a0a',
          100: '#0c0c0c',
          200: '#0e0e0e',
          300: '#121212',
          400: '#161616',
          500: '#1a1a1a',
          600: '#1e1e1e',
          700: '#222222',
        },
        'custom-light': {
          50: '#f5f5f7',
          100: '#e5e5e7',
          200: '#d5d5d7',
          300: '#c5c5c7',
          400: '#b5b5b7',
          500: '#a5a5a7',
        },
      },
    },
  },
  plugins: [],
}

