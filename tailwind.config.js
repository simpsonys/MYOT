/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        myot: {
          bg: '#0A0E1A',
          card: '#141B2D',
          accent: '#00D4FF',
          purple: '#7B61FF',
          coral: '#FF6B6B',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
