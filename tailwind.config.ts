import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary – deep obsidian
        primary: {
          50:  '#f0f0ff',
          100: '#e0e0ff',
          200: '#c2c2ff',
          300: '#9c9cff',
          400: '#7272ff',
          500: '#4a4aff',
          600: '#2222e0',
          700: '#1a1ab0',
          800: '#111180',
          900: '#0a0a50',
          950: '#050528',
          DEFAULT: '#1a1a2e',
        },
        // Accent – warm gold for luxury
        gold: {
          50:  '#fffdf0',
          100: '#fffae0',
          200: '#fff3b3',
          300: '#ffe880',
          400: '#ffd94d',
          500: '#ffc72c',
          600: '#e0a800',
          700: '#b08000',
          800: '#805c00',
          900: '#4d3800',
          DEFAULT: '#c9a227',
        },
        // Surface
        surface: {
          DEFAULT: '#fafaf8',
          dark: '#111118',
          card: '#ffffff',
        },
        // Semantic
        success: '#22c55e',
        warning: '#f59e0b',
        error:   '#ef4444',
        info:    '#3b82f6',
      },
      fontFamily: {
        // Display: Cormorant Garamond for luxury editorial feel
        display: ['var(--font-cormorant)', ...fontFamily.serif],
        // Body: Inter for crisp readability
        sans:    ['var(--font-inter)', ...fontFamily.sans],
        // Mono: for prices, codes
        mono:    ['var(--font-jetbrains)', ...fontFamily.mono],
      },
      fontSize: {
        '2xs': ['0.625rem',  { lineHeight: '1rem' }],
        '9xl': ['8rem',      { lineHeight: '1' }],
        '10xl': ['10rem',    { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '104': '26rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'product': '0 4px 24px -4px rgba(0,0,0,0.08), 0 2px 8px -2px rgba(0,0,0,0.04)',
        'product-hover': '0 16px 48px -8px rgba(0,0,0,0.16), 0 4px 16px -4px rgba(0,0,0,0.08)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'gold': '0 4px 20px rgba(201, 162, 39, 0.3)',
        'inner-sm': 'inset 0 1px 2px rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'gradient-gold':    'linear-gradient(135deg, #c9a227 0%, #f0d060 50%, #c9a227 100%)',
        'gradient-dark':    'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)',
        'gradient-surface': 'linear-gradient(180deg, #fafaf8 0%, #f0efe8 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16,1,0.3,1)',
        'scale-in':   'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        'shimmer':    'shimmer 1.5s infinite',
        'float':      'float 6s ease-in-out infinite',
        'marquee':    'marquee 30s linear infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:  { from: { transform: 'translateY(20px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideDown:{ from: { transform: 'translateY(-20px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        scaleIn:  { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float:    { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        marquee:  { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      aspectRatio: {
        'product': '3/4',
        'banner': '16/5',
        'hero': '21/9',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'),
  ],
}

export default config
