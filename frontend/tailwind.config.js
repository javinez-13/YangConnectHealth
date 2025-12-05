/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A4D68', // Deep Navy
          light: '#0F7B9E',
        },
        secondary: {
          DEFAULT: '#5FB3D9', // Sky Blue
          light: '#A8D5E2', // Mint Green
        },
        accent: {
          DEFAULT: '#FF6B6B', // Bright Coral
          hover: '#FF5252',
        },
        neutral: {
          light: '#F5F7FA',
          DEFAULT: '#E8ECEF',
          dark: '#6C757D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Lato', 'Montserrat', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

