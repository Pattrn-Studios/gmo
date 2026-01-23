/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Text colors
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-inverse': 'var(--color-text-inverse)',

        // Background colors
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-tertiary': 'var(--color-bg-tertiary)',

        // Brand colors
        'brand': 'var(--color-brand)',
        'brand-light': 'var(--color-brand-light)',

        // Line colors
        'line-default': 'var(--color-line-default)',
        'line-strong': 'var(--color-line-strong)',

        // Chart colors
        'chart-1': 'var(--color-chart-1)',
        'chart-2': 'var(--color-chart-2)',
        'chart-3': 'var(--color-chart-3)',
        'chart-4': 'var(--color-chart-4)',
        'chart-5': 'var(--color-chart-5)',
        'chart-6': 'var(--color-chart-6)',
        'chart-7': 'var(--color-chart-7)',

        // Section theme colors
        'section-blue': 'var(--color-section-blue)',
        'section-green': 'var(--color-section-green)',
        'section-orange': 'var(--color-section-orange)',
        'section-brown': 'var(--color-section-brown)',
        'section-mint': 'var(--color-section-mint)',

        // GMO specific
        'gmo-green': '#008252',
        'gmo-blue': '#3E7274',
        'gmo-copper': '#3D748F',
      },
      fontFamily: {
        sans: ['BNPP Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        'container': '1400px',
        'narrow': '900px',
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
    },
  },
  plugins: [],
}
