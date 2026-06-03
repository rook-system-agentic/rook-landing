import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Rook warm brown palette (dark-first)
        rook: {
          bg: '#1a1410',
          surface: '#2a2118',
          'surface-light': '#3d3228',
          border: '#4a3d32',
          'border-light': '#6b5a4a',
          text: '#f5f0eb',
          'text-muted': '#b8a99a',
          'text-dim': '#8a7a6a',
        },
        gold: {
          DEFAULT: '#c4a35a',
          light: '#d4b86a',
          dark: '#a88a3a',
          muted: '#8b7340',
        },
        cream: {
          DEFAULT: '#faf6f0',
          dark: '#f0e8dc',
          paper: '#f5efe5',
        },
        accent: {
          green: '#4ade80',
          red: '#ef4444',
          blue: '#60a5fa',
        },
      },
      fontFamily: {
        display: ['Manrope', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-sm': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body-md': ['1rem', { lineHeight: '1.7' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
        'label': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      borderRadius: {
        'rook': '12px',
        'rook-lg': '16px',
        'rook-xl': '24px',
      },
      boxShadow: {
        'rook': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'rook-lg': '0 8px 48px rgba(0, 0, 0, 0.4)',
        'gold': '0 0 24px rgba(196, 163, 90, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 24px rgba(196, 163, 90, 0.2)' },
          '50%': { boxShadow: '0 0 48px rgba(196, 163, 90, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
