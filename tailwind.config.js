/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          50: '#faf9f6',
          100: '#f4f2ec',
          200: '#e8e5dc',
          300: '#d5d0c3',
          400: '#b8b19e',
          500: '#9b927e',
          600: '#7f7663',
          700: '#655e4f',
          800: '#4d473d',
          900: '#1e1d1a',
          950: '#12110f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        'hover-card': '0 16px 32px -8px rgba(0, 0, 0, 0.09), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
