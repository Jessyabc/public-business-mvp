export const tokens = {
  // Spacing scale
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
  },

  // Border radius scale
  radii: {
    sm: '0.375rem', // 6px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadow system
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    glassHover: '0 16px 50px 0 rgba(31, 38, 135, 0.4)',
  },

  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },

  // Mode-specific gradients
  gradients: {
    public: {
      background: 'radial-gradient(ellipse 80% 80% at 50% -20%, hsl(206 74% 59% / 0.15) 0%, transparent 50%), radial-gradient(ellipse 80% 80% at 80% 50%, hsl(206 74% 59% / 0.1) 0%, transparent 50%)',
      card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 255, 255, 0.08) 100%)',
    },
    business: {
      background: 'radial-gradient(ellipse 70% 70% at 30% 20%, hsl(206 74% 59% / 0.08) 0%, transparent 40%), radial-gradient(ellipse 90% 90% at 80% 80%, hsl(220 60% 70% / 0.06) 0%, transparent 50%), radial-gradient(ellipse 100% 60% at 50% -10%, hsl(200 80% 65% / 0.04) 0%, transparent 60%), linear-gradient(135deg, hsl(210 20% 98%) 0%, hsl(220 15% 96%) 100%)',
      card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(248, 250, 252, 0.35) 50%, rgba(241, 245, 249, 0.4) 100%)',
    },
  },
} as const;

export type Spacing = keyof typeof tokens.spacing;
export type Radii = keyof typeof tokens.radii;
export type Shadow = keyof typeof tokens.shadows;
export type ZIndex = keyof typeof tokens.zIndex;