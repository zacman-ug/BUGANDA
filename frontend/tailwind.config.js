/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        heritage: {
          gold: '#C4A035',
          dark: '#2C1810',
          cream: '#F8F5F0'
        }
      }
    }
  },
  plugins: []
};
