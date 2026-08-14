/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        safeNavy: {
          950: '#070B19',
          900: '#0B132B',
          800: '#1C2541',
          700: '#273459',
          600: '#3A506B',
          500: '#4A6588',
          100: '#E2E8F0',
        },
        safeTeal: {
          500: '#5BC0BE',
          400: '#6FFFE9',
        },
        emergency: {
          DEFAULT: '#EF4444',
          hover: '#DC2626',
          dark: '#991B1B',
          glow: 'rgba(239, 68, 68, 0.4)',
        },
        safeGreen: {
          DEFAULT: '#10B981',
          dark: '#059669',
          light: '#D1FAE5',
        },
        warningAmber: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
          light: '#FEF3C7',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'sos-ripple': 'sosRipple 1.8s ease-out infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        sosRipple: {
          '0%': { transform: 'scale(0.95)', opacity: '0.9', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
          '70%': { transform: 'scale(1.15)', opacity: '0.3', boxShadow: '0 0 0 35px rgba(239, 68, 68, 0)' },
          '100%': { transform: 'scale(1.2)', opacity: '0', boxShadow: '0 0 0 45px rgba(239, 68, 68, 0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
