import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: 'rgb(var(--parchment-50) / <alpha-value>)',
          100: 'rgb(var(--parchment-100) / <alpha-value>)',
          200: 'rgb(var(--parchment-200) / <alpha-value>)',
          300: 'rgb(var(--parchment-300) / <alpha-value>)',
          400: 'rgb(var(--parchment-400) / <alpha-value>)',
          500: 'rgb(var(--parchment-500) / <alpha-value>)',
        },
        lavender: {
          50: 'rgb(var(--lavender-50) / <alpha-value>)',
          100: 'rgb(var(--lavender-100) / <alpha-value>)',
          200: 'rgb(var(--lavender-200) / <alpha-value>)',
          300: 'rgb(var(--lavender-300) / <alpha-value>)',
          400: 'rgb(var(--lavender-400) / <alpha-value>)',
          500: 'rgb(var(--lavender-500) / <alpha-value>)',
          600: 'rgb(var(--lavender-600) / <alpha-value>)',
          700: 'rgb(var(--lavender-700) / <alpha-value>)',
          800: 'rgb(var(--lavender-800) / <alpha-value>)',
          900: 'rgb(var(--lavender-900) / <alpha-value>)',
        },
        ink: {
          50: 'rgb(var(--ink-50) / <alpha-value>)',
          100: 'rgb(var(--ink-100) / <alpha-value>)',
          200: 'rgb(var(--ink-200) / <alpha-value>)',
          300: 'rgb(var(--ink-300) / <alpha-value>)',
          400: 'rgb(var(--ink-400) / <alpha-value>)',
          500: 'rgb(var(--ink-500) / <alpha-value>)',
          600: 'rgb(var(--ink-600) / <alpha-value>)',
          700: 'rgb(var(--ink-700) / <alpha-value>)',
          800: 'rgb(var(--ink-800) / <alpha-value>)',
          900: 'rgb(var(--ink-900) / <alpha-value>)',
        },
        gold: {
          400: 'rgb(var(--gold-400) / <alpha-value>)',
          500: 'rgb(var(--gold-500) / <alpha-value>)',
          600: 'rgb(var(--gold-600) / <alpha-value>)',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        explanation: ['"Times New Roman"', 'Times', 'serif'],
      },
      fontSize: {
        display: ['45px', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        headline: ['28px', { lineHeight: '1.2' }],
        title: ['16px', { lineHeight: '1.4' }],
        body: ['14px', { lineHeight: '1.6' }],
        label: ['12px', { lineHeight: '1.4' }],
      },
      letterSpacing: {
        wide2: '0.15em',
        wide3: '0.25em',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'breath': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.08)', opacity: '0.8' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'fade-in': 'fade-in 0.8s ease-out both',
        'soft-pulse': 'soft-pulse 2.4s ease-in-out infinite',
        'breath': 'breath 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
