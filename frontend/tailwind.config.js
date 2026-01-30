// Static theme values - these match the CSS variables defined in index.css
// Using CSS variables ensures runtime theme switching works correctly
// and avoids TypeScript import issues in build environments like Lovable.dev

// Build semantic color palette using CSS variables
// These will be resolved at runtime based on the active theme
const pbColors = {
  background: 'var(--background)',
  surface: 'var(--surface)',
  'text-primary': 'var(--text-primary)',
  'text-secondary': 'var(--text-secondary)',
  'text-tertiary': 'var(--text-tertiary)',
  accent: 'var(--accent)',
  'accent-on': 'var(--accent-on)',
  border: 'var(--border)',
  focus: 'var(--focus)',
};

// Border radii scale using CSS variables
const pbRadii = {
  'pb-sm': 'var(--radius-sm)',
  'pb-md': 'var(--radius-md)',
  'pb-lg': 'var(--radius-lg)',
  'pb-xl': 'var(--radius-xl)',
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
        
        // PB Brand Colors
        "pb-aqua": "#67FFD8",
        "pb-gold": "#FFC85B",
        
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
        // Ambient glass shadows for navigation
        'glass-ambient': '0 0 25px rgba(0, 0, 0, 0.12)',
        'glass-ambient-sm': '0 0 20px rgba(0, 0, 0, 0.10)',
        'glass-ambient-lg': '0 0 35px rgba(0, 0, 0, 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      },
      borderRadius: {
        // PB-specific radii
        ...pbRadii,
        // Glass pill navigation
        'glass-pill': '35px',
        'glass-pill-sm': '30px',
        'glass-pill-lg': '40px',
      },
      spacing: {
        // Tighter steps for mobile-first layouts
        '0.5': '0.125rem',  // 2px
        '1.5': '0.375rem',  // 6px
      },
      backdropBlur: {
        xs: "2px",
        // Glass navigation blur
        'glass-nav': '35px',
        'glass-nav-sm': '30px',
        'glass-nav-lg': '40px',
      },
      transitionTimingFunction: {
        // Spring-like transitions
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
