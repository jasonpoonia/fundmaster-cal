/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEEEFF',
          100: '#E0E0FF',
          200: '#C5C5FF',
          300: '#A5A5FF',
          400: '#7B7BFF',
          500: '#2C2781',
          600: '#252069',
          700: '#1D1951',
          800: '#161339',
          900: '#0E0C21',
        }
      }
    },
  },
  plugins: [],
};