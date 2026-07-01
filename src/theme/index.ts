export const lightTheme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#1853db',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#f8fafc',
      100: '#e2e8f0',
      500: '#64748b',
      600: '#475569',
    },
    surface: {
      primary: '#ffffff',
      secondary: '#f8fbff',
      tertiary: '#eef6ff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      inverse: '#ffffff',
    },
    border: {
      primary: '#dbeafe',
      secondary: '#bfdbfe',
      muted: '#e2e8f0',
    },
    header: {
      primary: '#1d4ed8',
      secondary: '#2563eb',
      border: '#60a5fa',
      text: '#ffffff',
      accent: '#bfdbfe',
    },
    success: {
      50: '#ecfdf5',
      500: '#10b981',
      600: '#059669',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
    },
    sidebar: {
      primary: '#1d4ed8',
      secondary: '#1e40af',
      accent: '#162436',
      muted: '#92abbe',
      ink: '#0d1b2a',
      surface: 'rgba(29, 78, 216, 0.92)',
      border: 'rgba(255, 255, 255, 0.14)',
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
      50: '#dbeafe',
      100: '#bfdbfe',
      200: '#93c5fd',
      300: '#60a5fa',
      400: '#3b82f6',
      500: '#2563eb',
      600: '#1d4ed8',
      700: '#1e40af',
      800: '#1e3a8a',
      900: '#172554',
    },
    secondary: {
      50: '#f8fafc',
      100: '#e2e8f0',
      500: '#94a3b8',
      600: '#64748b',
    },
    surface: {
      primary: '#0f172a',
      secondary: '#111827',
      tertiary: '#1e293b',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      inverse: '#0f172a',
    },
    border: {
      primary: '#1e293b',
      secondary: '#334155',
      muted: '#475569',
    },
    header: {
      primary: '#0f1f3d',
      secondary: '#172554',
      border: '#243b67',
      text: '#f8fafc',
      accent: '#93c5fd',
    },
    success: {
      50: '#064e3b',
      500: '#34d399',
      600: '#10b981',
    },
    error: {
      50: '#7f1d1d',
      500: '#f87171',
      600: '#ef4444',
    },
    warning: {
      50: '#78350f',
      500: '#fbbf24',
      600: '#f59e0b',
    },
    sidebar: {
      primary: '#172554',
      secondary: '#1e3a8a',
      accent: '#93c5fd',
      muted: '#92abbe',
      ink: '#0d1b2a',
      surface: 'rgba(23, 37, 84, 0.92)',
      border: 'rgba(255, 255, 255, 0.12)',
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

export type ThemeMode = keyof typeof themes;
