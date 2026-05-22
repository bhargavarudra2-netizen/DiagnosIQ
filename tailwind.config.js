/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#030712',
          card: '#0b1329',
          cardLight: '#111c3a',
          cyan: '#00f2fe',
          emerald: '#05cd99',
          amber: '#ffb800',
          red: '#ff4a5a',
          slate: '#1f2937',
          gray: '#9ca3af',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'scan': 'scanLine 2.5s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'shimmer': 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: 0.7, filter: 'drop-shadow(0 0 4px rgba(0, 242, 254, 0.4))' },
          '50%': { opacity: 1, filter: 'drop-shadow(0 0 15px rgba(0, 242, 254, 0.8))' },
        },
        scanLine: {
          '0%': { top: '0%' },
          '50%': { top: '100%' },
          '100%': { top: '0%' },
        },
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
