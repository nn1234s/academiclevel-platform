/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      borderRadius: {
        none: '0px',
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '14px',
        '2xl': '18px',
        '3xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        none: 'none',
        '2xs': '0 1px 2px rgba(15, 23, 42, 0.05)',
        xs: '0 1px 3px rgba(15, 23, 42, 0.08)',
        sm: '0 2px 6px rgba(15, 23, 42, 0.08)',
        DEFAULT: '0 4px 12px rgba(15, 23, 42, 0.08)',
        md: '0 6px 16px rgba(15, 23, 42, 0.10)',
        lg: '0 10px 24px rgba(15, 23, 42, 0.12)',
        xl: '0 14px 30px rgba(15, 23, 42, 0.14)',
        '2xl': '0 20px 40px rgba(15, 23, 42, 0.18)',
        dp1: '0 1px 3px rgba(15, 23, 42, 0.08)',
        dp2: '0 3px 8px rgba(15, 23, 42, 0.09)',
        dp4: '0 4px 12px rgba(15, 23, 42, 0.10)',
        dp6: '0 6px 16px rgba(15, 23, 42, 0.12)',
        dp8: '0 10px 24px rgba(15, 23, 42, 0.14)',
        dp16: '0 18px 36px rgba(15, 23, 42, 0.18)',
      },
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
        sans: ['"Google Sans"', '"Google Sans Flex"', '"Google Sans Text"', '"Product Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Google Sans"', '"Google Sans Flex"', '"Product Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Google Sans"', '"Google Sans Flex"', '"Product Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        flex: ['"Google Sans Flex"', '"Google Sans"', 'sans-serif'],
        body: ['"Google Sans"', '"Google Sans Text"', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
