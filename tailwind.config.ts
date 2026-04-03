import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0a0f0a',
          card: '#0f1a0f',
          elevated: '#142014',
        },
        primary: {
          DEFAULT: '#1a472a',
          light: '#236b3a',
          dark: '#0f2d19',
        },
        accent: {
          DEFAULT: '#d4af37',
          light: '#e8c84a',
          dark: '#b8962e',
        },
        danger: {
          DEFAULT: '#c0392b',
          light: '#e74c3c',
          dark: '#96281b',
        },
        gold: '#d4af37',
        silver: '#c0c0c0',
        bronze: '#cd7f32',
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
      },
      animation: {
        'glow-gold': 'glowGold 2s ease-in-out infinite',
        'glow-red': 'glowRed 2s ease-in-out infinite',
        'confetti': 'confetti 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        glowGold: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(212,175,55,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(212,175,55,0.7)' },
        },
        glowRed: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(192,57,43,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(192,57,43,0.7)' },
        },
        confetti: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1.5) rotate(180deg)', opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
