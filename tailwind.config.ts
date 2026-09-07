import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep navy — primary brand color for headings, navigation, and emphasis.
        navy: {
          50: '#F4F6FA',
          100: '#E5EAF3',
          200: '#C8D3E5',
          300: '#A2B4CF',
          400: '#7490B7',
          500: '#4E6C9E',
          600: '#3A5584',
          700: '#2B4167',
          800: '#1A2B4A',
          900: '#141F35',
          950: '#0D1523',
        },
        // Professional teal — accent for actions, highlights, and active states.
        accent: {
          50: '#EEF7F7',
          100: '#D8EDED',
          200: '#B2DBDD',
          300: '#7FC3C6',
          400: '#45A6AA',
          500: '#148E93',
          600: '#0D7377',
          700: '#0B5D61',
          800: '#09464A',
          900: '#063033',
        },
      },
      fontFamily: {
        sans: ['var(--font-plex-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.05)',
        popover: '0 4px 16px -2px rgb(15 23 42 / 0.12), 0 2px 4px -2px rgb(15 23 42 / 0.06)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-1rem)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'page-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'row-in': {
          from: { opacity: '0', transform: 'translateY(3px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'sort-icon': {
          from: { transform: 'scale(0.6)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'urgency-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgb(220 38 38 / 0.45)' },
          '50%': { boxShadow: '0 0 0 4px rgb(220 38 38 / 0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'slide-in-left': 'slide-in-left 200ms ease-out',
        'scale-in': 'scale-in 150ms ease-out',
        'page-in': 'page-in 220ms ease-out',
        'row-in': 'row-in 200ms ease-out both',
        'sort-icon': 'sort-icon 180ms ease-out',
        'urgency-pulse': 'urgency-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
