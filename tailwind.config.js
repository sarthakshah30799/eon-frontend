/** @type {import('tailwindcss').Config} */
const color = variable => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: color('--color-primary-50'),
          100: color('--color-primary-100'),
          200: color('--color-primary-200'),
          300: color('--color-primary-300'),
          400: color('--color-primary-400'),
          500: color('--color-primary-500'),
          600: color('--color-primary-600'),
          700: color('--color-primary-700'),
          800: color('--color-primary-800'),
          900: color('--color-primary-900'),
        },
        secondary: {
          50: color('--color-secondary-50'),
          100: color('--color-secondary-100'),
          200: color('--color-secondary-200'),
          300: color('--color-secondary-300'),
          400: color('--color-secondary-400'),
          500: color('--color-secondary-500'),
          600: color('--color-secondary-600'),
          700: color('--color-secondary-700'),
          800: color('--color-secondary-800'),
          900: color('--color-secondary-900'),
        },
        surface: {
          primary: color('--color-surface-primary'),
          secondary: color('--color-surface-secondary'),
          tertiary: color('--color-surface-tertiary'),
        },
        text: {
          primary: color('--color-text-primary'),
          secondary: color('--color-text-secondary'),
          tertiary: color('--color-text-tertiary'),
          inverse: color('--color-text-inverse'),
        },
        border: {
          primary: color('--color-border-primary'),
          secondary: color('--color-border-secondary'),
          muted: color('--color-border-muted'),
        },
        header: {
          primary: color('--color-header-primary'),
          secondary: color('--color-header-secondary'),
          border: color('--color-header-border'),
          text: color('--color-header-text'),
          accent: color('--color-header-accent'),
        },
        success: {
          50: color('--color-success-50'),
          500: color('--color-success-500'),
          600: color('--color-success-600'),
        },
        error: {
          50: color('--color-error-50'),
          500: color('--color-error-500'),
          600: color('--color-error-600'),
        },
        warning: {
          50: color('--color-warning-50'),
          500: color('--color-warning-500'),
          600: color('--color-warning-600'),
        },
        sidebar: {
          primary: color('--color-sidebar-primary'),
          secondary: color('--color-sidebar-secondary'),
          accent: color('--color-sidebar-accent'),
          surface: color('--color-sidebar-surface'),
          border: color('--color-sidebar-border'),
        },
      },
    },
  },
  plugins: [],
};
