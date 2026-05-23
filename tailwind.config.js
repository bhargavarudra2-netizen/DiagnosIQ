/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Clinical Light Palette (primary design system) ──────────────
        medical: {
          white:    '#FFFFFF',
          soft:     '#F8FBFF',
          muted:    '#F1F5F9',
          border:   '#E2E8F0',
          blueBorder: '#BFDBFE',
          blueTint: '#EFF6FF',
          blue:     '#2563EB',
          blueHover:'#1D4ED8',
          blueLight:'#3B82F6',
          navy:     '#0F172A',
          slate:    '#475569',
          gray:     '#94A3B8',
          red:      '#EF4444',
          redSoft:  '#FEF2F2',
          redBorder:'#FCA5A5',
          green:    '#22C55E',
          greenSoft:'#F0FDF4',
          amber:    '#F59E0B',
          amberSoft:'#FFFBEB',
          cyan:     '#06B6D4',
        },
        // ── Keep cyber tokens for backward compat (components still ref them) ──
        cyber: {
          bg:        '#030712',
          card:      '#0b1329',
          cardLight: '#111c3a',
          cyan:      '#00f2fe',
          emerald:   '#05cd99',
          amber:     '#ffb800',
          red:       '#ff4a5a',
          slate:     '#1f2937',
          gray:      '#9ca3af',
        }
      },
      fontFamily: {
        sans:   ['Inter', 'system-ui', 'sans-serif'],
        outfit: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in':     'fadeIn 0.5s ease-out forwards',
        'fade-up':     'fadeUp 0.6s ease-out forwards',
        'float':       'float 4s ease-in-out infinite',
        'pulse-dot':   'pulseDot 1.8s ease-in-out infinite',
        'scan':        'scanLine 2.5s linear infinite',
        'shimmer':     'shimmer 1.5s infinite linear',
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
        'scale-in':    'scaleIn 0.3s ease-out forwards',
        'slide-up':    'slideUp 0.4s ease-out forwards',
        'progress':    'progressFill 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeUp: {
          '0%':   { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: 1 },
          '50%':      { transform: 'scale(1.5)', opacity: 0.6 },
        },
        scanLine: {
          '0%':   { top: '0%' },
          '50%':  { top: '100%' },
          '100%': { top: '0%' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: 0.7 },
          '50%':      { opacity: 1 },
        },
        scaleIn: {
          '0%':   { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        slideUp: {
          '0%':   { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        progressFill: {
          '0%':   { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      boxShadow: {
        'glass':   '0 4px 24px rgba(37, 99, 235, 0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'glass-md':'0 8px 32px rgba(37, 99, 235, 0.10), 0 2px 8px rgba(0,0,0,0.04)',
        'glass-lg':'0 16px 48px rgba(37, 99, 235, 0.14), 0 4px 12px rgba(0,0,0,0.06)',
        'blue':    '0 4px 16px rgba(37, 99, 235, 0.20)',
        'blue-lg': '0 8px 32px rgba(37, 99, 235, 0.28)',
        'red':     '0 4px 16px rgba(239, 68, 68, 0.15)',
        'inner-blue': 'inset 0 0 0 1px rgba(37, 99, 235, 0.15)',
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
