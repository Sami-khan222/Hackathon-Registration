/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#07122b', 900: '#0B1B3A', 800: '#132a55', 700: '#1d3a73', 300: '#a9b6d3', 200: '#cfd8ea' },
        brand: { 50: '#eef2ff', 100: '#dfe7ff', 500: '#2F5BEA', 600: '#2449c7', 700: '#1c3aa3' },
        violet: { 50: '#f3f0ff', 500: '#7C5CFA', 600: '#6644e8' },
        surface: '#F7F9FC',
        line: '#E3E8F2',
        muted: '#5b6784',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,27,58,.04), 0 8px 24px -12px rgba(11,27,58,.12)',
        pass: '0 30px 60px -24px rgba(11,27,58,.45)',
      },
    },
  },
  plugins: [],
};
