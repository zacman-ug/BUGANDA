/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // We are adding custom colors for the Buganda Heritage theme
        'heritage-gold': '#D4AF37', // Gold for royalty/clans
        'heritage-dark': '#1a1a1a', // Dark charcoal for professional feel
        'heritage-cream': '#FDFBF7', // Off-white for a parchment/history look
        'heritage-bronze': '#8B6914',
        'heritage-light': '#F5F3EE',
      },
      fontFamily: {
        'serif': ['Merriweather', 'Georgia', 'serif'],
        'display': ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'pulse-gold': 'pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(212, 175, 55, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        glow: {
          '0%, 100%': { textShadow: '0 0 5px rgba(212, 175, 55, 0.5)' },
          '50%': { textShadow: '0 0 15px rgba(212, 175, 55, 0.8)' },
        },
      },
      boxShadow: {
        'heritage': '0 4px 15px rgba(212, 175, 55, 0.2)',
        'heritage-lg': '0 10px 25px rgba(212, 175, 55, 0.15)',
        'inner-gold': 'inset 0 2px 4px rgba(212, 175, 55, 0.1)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}