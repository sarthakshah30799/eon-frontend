export const lightTheme = {
  colors: {
    primary: {
      50: '#3b82f6',      // Blue
      100: '#dbeafe',     // Light blue
      500: '#3b82f6',     // Blue
      600: '#2563eb',     // Darker blue
      700: '#1d4ed8',     // Even darker blue
    },
    secondary: {
      50: '#f3f4f6',      // Gray
      100: '#e5e7eb',     // Light gray
      500: '#6b7280',     // Medium gray
      600: '#4b5563',     // Darker gray
    },
    background: {
      primary: '#ffffff',      // White
      secondary: '#f9fafb',     // Very light gray
      tertiary: '#f3f4f6',     // Light gray
    },
    text: {
      primary: '#111827',      // Dark gray
      secondary: '#6b7280',     // Medium gray
      tertiary: '#9ca3af',     // Light gray
    },
    border: {
      primary: '#e5e7eb',     // Light gray
      secondary: '#d1d5db',   // Medium gray
    },
    success: {
      50: '#10b981',      // Green
      500: '#059669',     // Darker green
    },
    error: {
      50: '#ef4444',      // Red
      500: '#dc2626',     // Darker red
    },
    warning: {
      50: '#f59e0b',      // Orange
      500: '#d97706',     // Darker orange
    },
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
  },
};

export const darkTheme = {
  colors: {
    primary: {
      50: '#60a5fa',      // Lighter blue
      100: '#93c5fd',     // Light blue
      500: '#3b82f6',     // Blue
      600: '#2563eb',     // Darker blue
      700: '#1e40af',     // Even darker blue
    },
    secondary: {
      50: '#f3f4f6',      // Gray
      100: '#e5e7eb',     // Light gray
      500: '#6b7280',     // Medium gray
      600: '#4b5563',     // Darker gray
    },
    background: {
      primary: '#111827',      // Dark background
      secondary: '#1f2937',     // Darker gray
      tertiary: '#374151',     // Even darker gray
    },
    text: {
      primary: '#f9fafb',      // Light text
      secondary: '#d1d5db',     // Medium light text
      tertiary: '#9ca3af',     // Light gray text
    },
    border: {
      primary: '#374151',     // Dark border
      secondary: '#4b5563',     // Medium dark border
    },
    success: {
      50: '#34d399',      // Green
      500: '#10b981',     // Darker green
    },
    error: {
      50: '#f87171',      // Red
      500: '#ef4444',     // Darker red
    },
    warning: {
      50: '#fbbf24',      // Orange
      500: '#f59e0b',     // Darker orange
    },
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(255, 255, 255, 0.05)',
    md: '0 4px 6px -1px rgba(255, 255, 255, 0.07)',
    lg: '0 10px 15px -3px rgba(255, 255, 255, 0.1)',
    xl: '0 20px 25px -5px rgba(255, 255, 255, 0.15)',
  },
};

export type Theme = typeof lightTheme;

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export const defaultTheme = 'light';
