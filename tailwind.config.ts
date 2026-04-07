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
          DEFAULT: '#000000',
          card: '#00050f',
          elevated: '#000d1a',
        },
        primary: {
          DEFAULT: '#0066ff',
          light: '#3385ff',
          dark: '#0044cc',
        },
        accent: {
          DEFAULT: '#00d4ff',
          light: '#33ddff',
          dark: '#0099cc',
        },
        cyan: {
          DEFAULT: '#00ffcc',
          dark: '#00cc99',
        },
        danger: {
          DEFAULT: '#ff3366',
          light: '#ff6699',
          dark: '#cc0033',
        },
        gold: '#ffd700',
        silver: '#c0c0c0',
        bronze: '#cd7f32',
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
        display: ['Rajdhani', 'Noto Sans JP', 'sans-serif'],
      },
      animation: {
        'glow-gold': 'glowGold 2s ease-in-out infinite',
        'glow-cyan': 'glowCyan 2s ease-in-out infinite',
        'glow-red': 'glowRed 2s ease-in-out infinite',
        'confetti': 'confetti 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pulse-blue': 'pulseBlue 3s ease-in-out infinite',
      },
      keyframes: {
        glowGold: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255,215,0,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(255,215,0,0.7)' },
        },
        glowCyan: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,212,255,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0,212,255,0.7)' },
        },
        glowRed: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255,51,102,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(255,51,102,0.7)' },
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
        pulseBlue: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-cyan-lg': '0 0 40px rgba(0, 212, 255, 0.5)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.4)',
        'glow-silver': '0 0 15px rgba(192, 192, 192, 0.3)',
        'glow-bronze': '0 0 15px rgba(205, 127, 50, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 212, 255, 0.1)',
      },
    },
  },
  plugins: [],
} satisfies Config
