/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1A1A2E',
        'navy-light': '#16213E',
        'navy-card': '#0F3460',
        accent: '#E94560',
        'accent-dark': '#c73650',
      },
      fontFamily: {
        sans: ['Sarabun', 'sans-serif'],
        heading: ['Kanit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
