/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        heritage: {
          gold: '#C4A035',
          dark: '#2C1810',
          cream: '#F8F5F0',
          bronze: '#8B6914'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
