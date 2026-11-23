/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      fontFamily: {
        sans: ['"Google Sans Flex"', '"Google Sans"', '"Google Sans Text"', '"Product Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Google Sans"', '"Google Sans Flex"', '"Product Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Google Sans"', '"Google Sans Flex"', '"Product Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        flex: ['"Google Sans Flex"', '"Google Sans"', 'sans-serif'],
        body: ['"Google Sans Flex"', '"Google Sans Text"', '"Google Sans"', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
