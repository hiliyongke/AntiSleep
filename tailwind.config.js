/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* Microsoft Fluent Design Accent Colors */
        accent: {
          DEFAULT: '#0078D4',   // Fluent primary accent
          hover: '#1a86d9',     // hover state
          active: '#005A9E',    // pressed state
          subtle: 'rgba(0, 120, 212, 0.15)', // subtle background
        },
        /* Semantic Colors */
        primary: {
          blue: '#0078D4',      // Fluent accent blue
          green: '#0F7B0F',     // Fluent success green
          orange: '#D83B01',    // Fluent caution orange
          red: '#D13438',       // Fluent error red
        },
        /* Fluent Dark Theme Surface Colors */
        background: {
          deep: '#000000',      // Screen base
          mica: '#202020',      // Mica window background
          medium: '#1C1C1E',    // Panel background
          light: '#2C2C2E',     // Card / elevated surface
          lighter: '#3A3A3C',   // Hover / active surface
          subtle: 'rgba(255, 255, 255, 0.04)', // subtle fill
        },
        text: {
          primary: '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.60)',
          tertiary: 'rgba(255, 255, 255, 0.35)',
          disabled: 'rgba(255, 255, 255, 0.20)',
        },
        functional: {
          success: '#0F7B0F',
          error: '#D13438',
          warning: '#D83B01',
        },
        /* Fluent Acrylic Tint Colors */
        tint: {
          dark: 'rgba(44, 44, 44, 0.65)',    // Dark Acrylic tint
          light: 'rgba(44, 44, 44, 0.50)',    // Light Acrylic tint
          subtle: 'rgba(44, 44, 46, 0.40)',   // Subtle Acrylic tint
          smoke: 'rgba(32, 32, 32, 0.80)',    // Mica tint
        },
        /* Fluent Border Colors */
        border: {
          'fluent': 'rgba(255, 255, 255, 0.08)',
          'fluent-hover': 'rgba(255, 255, 255, 0.14)',
          'fluent-active': 'rgba(255, 255, 255, 0.04)',
          'accent': 'rgba(0, 120, 212, 0.40)',
        },
      },
      fontFamily: {
        fluent: ['"Segoe UI Variable"', '"Segoe UI"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      /* Fluent Design Animation System */
      animation: {
        /* Standard Fluent animations */
        'breathe': 'breathe 2s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'fade-in': 'fade-in 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-out': 'fade-out 200ms cubic-bezier(0.7, 0, 1, 0.5)',
        'slide-up': 'slide-up 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slide-down 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slide-in-right 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        'ripple': 'ripple 0.6s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        /* Marquee animations */
        'marquee-horizontal': 'marquee-horizontal var(--marquee-duration, 8s) linear infinite',
        'marquee-vertical': 'marquee-vertical var(--marquee-duration, 8s) linear infinite',
        'fade-switch': 'fade-switch var(--marquee-duration, 4s) ease-in-out infinite',
        /* Fluent-specific */
        'reveal-pulse': 'reveal-pulse 1.5s ease-in-out infinite',
        'accent-glow': 'accent-glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.15)', opacity: '0.8' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-out': {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.96)' },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          from: { transform: 'translateY(-20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(20px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        glow: {
          '0%': { textShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '100%': { textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' },
        },
        'marquee-horizontal': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'marquee-vertical': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        'fade-switch': {
          '0%, 40%': { opacity: '1' },
          '50%, 90%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'reveal-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 120, 212, 0.20)' },
          '50%': { boxShadow: '0 0 0 8px rgba(0, 120, 212, 0)' },
        },
        'accent-glow': {
          '0%': { boxShadow: '0 0 8px rgba(0, 120, 212, 0.20), 0 0 16px rgba(0, 120, 212, 0.10)' },
          '100%': { boxShadow: '0 0 16px rgba(0, 120, 212, 0.30), 0 0 32px rgba(0, 120, 212, 0.15)' },
        },
      },
      /* Fluent blur values */
      backdropBlur: {
        xs: '2px',
        'acrylic': '30px',    // Fluent Acrylic standard
        'mica': '60px',       // Fluent Mica
      },
      /* Fluent border radius — WinUI3 standard is 8px */
      borderRadius: {
        'fluent': '8px',
        'fluent-lg': '12px',
        'fluent-xl': '16px',
      },
      /* Fluent transition timing */
      transitionTimingFunction: {
        'fluent-decelerate': 'cubic-bezier(0.16, 1, 0.3, 1)',    // Enter/expand
        'fluent-accelerate': 'cubic-bezier(0.7, 0, 1, 0.5)',     // Exit/collapse
        'fluent-standard': 'cubic-bezier(0.33, 0, 0.67, 1)',     // General
      },
      transitionDuration: {
        'fluent-fast': '150ms',
        'fluent-normal': '250ms',
        'fluent-slow': '350ms',
      },
      /* Fluent shadow scale */
      boxShadow: {
        'fluent-1': '0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'fluent-2': '0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 8px rgba(0, 0, 0, 0.06), 0 12px 24px rgba(0, 0, 0, 0.06)',
        'fluent-3': '0 2px 4px rgba(0, 0, 0, 0.04), 0 8px 16px rgba(0, 0, 0, 0.08), 0 28px 48px rgba(0, 0, 0, 0.10)',
        'accent': '0 0 0 1px rgba(0, 120, 212, 0.20), 0 2px 8px rgba(0, 120, 212, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
