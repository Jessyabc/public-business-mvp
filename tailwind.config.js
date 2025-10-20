import { resolveTheme } from './src/styles/theme.ts';

// Determine the default mode from environment or fallback to 'public'
const mode = process.env.VITE_DEFAULT_MODE || 'public';
const theme = resolveTheme(mode);

// Build semantic color palette from theme
const pbColors = {
  background: theme.colors.background,
  surface: theme.colors.surface,
  'text-primary': theme.colors.textPrimary,
  'text-secondary': theme.colors.textSecondary,
  'text-tertiary': theme.colors.textTertiary,
  accent: theme.colors.accent,
  'accent-on': theme.colors.accentOn,
  border: theme.colors.border,
  focus: theme.colors.focus,
};

// Map elevation scale to boxShadow utilities
const elevationShadows = {
  'elevation-1': theme.elevation[1],
  'elevation-2': theme.elevation[2],
  'elevation-4': theme.elevation[4],
  'elevation-8': theme.elevation[8],
  'elevation-16': theme.elevation[16],
  'elevation-24': theme.elevation[24],
};

// Border radii scale
const pbRadii = {
  'pb-sm': theme.radii.sm,
  'pb-md': theme.radii.md,
  'pb-lg': theme.radii.lg,
  'pb-xl': theme.radii.xl,
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors (keep for backward compatibility)
        "pb-blue": "#0a1f3a",
        "pb-blue-2": "#091931",
        
        // Semantic color system
        pb: pbColors,
      },
      boxShadow: {
        // Legacy glass shadow
        glass: "0 8px 32px rgba(0,0,0,0.35)",
        
        // Elevation scale
        ...elevationShadows,
      },
      borderRadius: {
        // PB-specific radii
        ...pbRadii,
      },
      spacing: {
        // Tighter steps for mobile-first layouts
        '0.5': '0.125rem',  // 2px
        '1.5': '0.375rem',  // 6px
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: [
    // Enable data-theme attribute variants
    function({ addVariant }) {
      addVariant('theme-public', '[data-theme="public"] &');
      addVariant('theme-business', '[data-theme="business"] &');
    }
  ]
}