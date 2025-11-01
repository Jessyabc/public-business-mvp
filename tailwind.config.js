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

// Border radii scale
const pbRadii = {
  'pb-sm': theme.radii.sm,
  'pb-md': theme.radii.md,
  'pb-lg': theme.radii.lg,
  'pb-xl': theme.radii.xl,
};

/**
 * Elevation Plugin
 * Generates elevation-1 through elevation-24 utility classes.
 * Each class uses the CSS variable injected by ThemeInjector at runtime.
 */
function elevationPlugin({ addUtilities }) {
  const elevations = {};
  for (let i = 1; i <= 24; i++) {
    elevations[`.elevation-${i}`] = { 
      boxShadow: `var(--elevation-${i})` 
    };
  }
  addUtilities(elevations);
}

/**
 * Responsive Spacing Plugin
 * Generates space-tight and space-normal utilities.
 * space-tight: Optimized for mobile with tighter spacing
 * space-normal: Standard spacing for larger screens
 */
function responsiveSpacingPlugin({ addUtilities, theme }) {
  const tightScale = {
    '.space-tight-xs': { gap: '0.25rem' },   // 4px
    '.space-tight-sm': { gap: '0.5rem' },    // 8px
    '.space-tight-md': { gap: '0.75rem' },   // 12px
    '.space-tight-lg': { gap: '1rem' },      // 16px
    '.space-tight-xl': { gap: '1.25rem' },   // 20px
  };
  
  const normalScale = {
    '.space-normal-xs': { gap: '0.5rem' },   // 8px
    '.space-normal-sm': { gap: '1rem' },     // 16px
    '.space-normal-md': { gap: '1.5rem' },   // 24px
    '.space-normal-lg': { gap: '2rem' },     // 32px
    '.space-normal-xl': { gap: '3rem' },     // 48px
  };
  
  addUtilities({ ...tightScale, ...normalScale });
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        // Legacy colors (keep for backward compatibility)
        "pb-blue": "#0a1f3a",
        "pb-blue-2": "#091931",
        
        // Semantic color system
        pb: pbColors,
        
        // Glass and theme tokens
        'glass-bg': 'var(--glass-bg)',
        'glass-border': 'var(--glass-border)',
        'card-bg': 'var(--card-bg)',
        'card-fg': 'var(--card-fg)',
        'card-fg-muted': 'var(--card-fg-muted)',
      },
      boxShadow: {
        // Glass shadow for dark theme
        glass: "0 0 12px rgba(0,0,0,0.35)",
        'glass-dark': '0 4px 12px rgba(0,0,0,0.4), 0 0 1px rgba(255,255,255,0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
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
    // Elevation utilities (elevation-1 through elevation-24)
    elevationPlugin,
    
    // Responsive spacing utilities (space-tight, space-normal)
    responsiveSpacingPlugin,
    
    // Enable data-theme attribute variants
    function({ addVariant }) {
      addVariant('theme-public', '[data-theme="public"] &');
      addVariant('theme-business', '[data-theme="business"] &');
    }
  ]
}