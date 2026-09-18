/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base brand tokens (from DESIGN.md and Stitch)
        'color-black': 'rgb(var(--color-black) / <alpha-value>)',
        'color-crimson': 'rgb(var(--color-crimson) / <alpha-value>)',
        'color-offwhite': 'rgb(var(--color-offwhite) / <alpha-value>)',
        'surface-dark': 'rgb(var(--color-surface-dark) / <alpha-value>)',
        'border-subtle': 'rgb(var(--color-border-subtle) / <alpha-value>)',

        // 3-tier risk system
        'risk-high': '#8B0D1A',
        'risk-medium': '#C97A2B',
        'risk-low': '#3A7D5C',

        // Stitch Obsidian & Crimson Glass extended surface palette
        'surface-container-lowest': 'rgb(var(--color-surface-lowest) / <alpha-value>)',
        'surface-container-low': 'rgb(var(--color-surface-low) / <alpha-value>)',
        'surface-container': 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-container-high': 'rgb(var(--color-surface-high) / <alpha-value>)',
        'surface-container-highest': 'rgb(var(--color-surface-highest) / <alpha-value>)',
        'surface-bright': 'rgb(var(--color-surface-bright) / <alpha-value>)',
        'surface-dim': 'rgb(var(--color-surface-dim) / <alpha-value>)',

        // Text / On-surface hierarchy
        'on-surface': 'rgb(var(--color-on-surface) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--color-on-surface-variant) / <alpha-value>)',
        'secondary': 'rgb(var(--color-on-surface-variant) / <alpha-value>)',
        'on-background': 'rgb(var(--color-on-background) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--color-muted-foreground) / <alpha-value>)',

        // Primary / Accents
        'primary': 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-container': '#8B0D1A',
        'on-primary': '#68000d',
        'on-primary-container': '#ff948f',
        'crimson-light': 'rgb(var(--color-crimson-light) / <alpha-value>)',

        // Liquid Glass Tokens
        'glass-surface': 'rgb(var(--color-glass-surface) / <alpha-value>)',
        'glass-border': 'rgb(var(--color-glass-border) / <alpha-value>)',
        'dark-glass': 'rgba(255, 255, 255, 0.035)',
      },
      fontFamily: {
        headline: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        full: '9999px',
      },
      boxShadow: {
        'glass': '0 16px 40px -12px rgba(0, 0, 0, 0.7)',
        'glass-hover': '0 24px 50px -12px rgba(0, 0, 0, 0.85)',
        'crimson-glow': '0 0 24px rgba(139, 13, 26, 0.35)',
        'crimson-ambient': '0 12px 36px -8px rgba(139, 13, 26, 0.35)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '24px',
      }
    },
  },
  plugins: [],
}
