/**
 * Design System Theme Configuration
 * 
 * Exports base tokens, mode-specific overrides, and visual effects
 * for the Public Business MVP application.
 */

export interface ThemeColors {
  /** Page canvas – the main background layer */
  background: string;
  /** Cards & menus – elevated surfaces above the background */
  surface: string;
  /** Primary text – main content and headings */
  textPrimary: string;
  /** Secondary text – descriptions and metadata */
  textSecondary: string;
  /** Tertiary text – hints and disabled states */
  textTertiary: string;
  /** Action colour – buttons, links, and interactive elements */
  accent: string;
  /** Text on accent – ensures readability on accent backgrounds */
  accentOn: string;
  /** Dividers & outlines – separates content areas */
  border: string;
  /** Focus rings – keyboard navigation and accessibility */
  focus: string;
}

export interface ThemeElevation {
  /** Subtle lift – hover states and slight separation */
  1: string;
  /** Card elevation – standard interactive surfaces */
  2: string;
  /** Raised cards – emphasized content */
  4: string;
  /** Floating panels – overlays and popovers */
  8: string;
  /** Modals & dialogs – highest content layer */
  16: string;
  /** Tooltips – absolutely positioned hints */
  24: string;
}

export interface ThemeRadii {
  /** Tight curves – small elements like badges */
  sm: string;
  /** Standard curves – buttons and inputs */
  md: string;
  /** Card curves – panels and surfaces */
  lg: string;
  /** Pronounced curves – hero elements */
  xl: string;
}

export interface ThemeSpacing {
  /** Tightest – inline spacing, icon gaps */
  xs: string;
  /** Tight – compact layouts, mobile-first */
  sm: string;
  /** Standard – default spacing between elements */
  md: string;
  /** Comfortable – breathing room for content */
  lg: string;
  /** Generous – section separation */
  xl: string;
  /** Spacious – major layout divisions */
  '2xl': string;
}

export interface ThemeEffects {
  /** Glass overlay background – translucent fill */
  glassBg: string;
  /** Glass overlay border – subtle edge definition */
  glassBorder: string;
  /** Glass blur intensity – backdrop effect strength */
  glassBlur: string;
  /** Warp distortion amount – refraction simulation */
  warpDistortion: string;
  /** Neumorphic raised shadow – soft outer shadow */
  neumorphicRaised?: string;
  /** Neumorphic inset shadow – soft inner shadow */
  neumorphicInset?: string;
}

export interface Theme {
  colors: ThemeColors;
  elevation: ThemeElevation;
  radii: ThemeRadii;
  spacing: ThemeSpacing;
  effects: ThemeEffects;
}

/**
 * Base tokens – shared foundation for all modes
 */
const base: Theme = {
  colors: {
    background: 'hsl(210, 40%, 98%)',
    surface: 'hsl(0, 0%, 100%)',
    textPrimary: 'hsl(212, 84%, 7%)',
    textSecondary: 'hsl(215, 16%, 47%)',
    textTertiary: 'hsl(215, 20%, 65%)',
    accent: 'hsl(202, 72%, 63%)',
    accentOn: 'hsl(0, 0%, 100%)',
    border: 'hsl(206, 30%, 85%)',
    focus: 'hsl(206, 74%, 59%)',
  },
  elevation: {
    1: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    2: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    4: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    8: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    16: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    24: '0 35px 60px -15px rgb(0 0 0 / 0.3)',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
  },
  effects: {
    glassBg: 'rgba(255, 255, 255, 0.48)',
    glassBorder: 'rgba(255, 255, 255, 0.55)',
    glassBlur: '18px',
    warpDistortion: '8',
  },
};

/**
 * Mode-specific overrides
 */
export const modes = {
  /**
   * Public mode – dark space-inspired aesthetic with glass panels
   * Features deep navy backdrop with translucent glass surfaces
   */
  public: {
    colors: {
      background: '#0b1f3a',                  // Deep navy canvas (space-inspired)
      surface: '#0f274a',                     // Slightly lighter surface
      textPrimary: '#e8eef6',                 // Near-white text
      textSecondary: '#a9b7c7',               // Muted light blue-grey
      textTertiary: '#6b7e94',                // Even more muted
      accent: '#489FE3',                      // Sky blue for actions
      accentOn: '#0b1f3a',                    // Dark text on accent
      border: 'rgba(255,255,255,0.15)',       // Subtle separators
      focus: '#60A5FA',                       // Lighter blue ring
    },
    effects: {
      glassBg: 'rgba(255, 255, 255, 0.10)',   // Translucent panel fill
      glassBorder: 'rgba(255, 255, 255, 0.15)', // Subtle glass border
      glassBlur: '16px',                       // Blur for glass effect
      warpDistortion: '10',                    // Enhanced warp
    },
  },

  /**
   * Business mode – warm neumorphic aesthetic
   * Clean, tactile surfaces with soft shadows for depth
   */
  business: {
    colors: {
      background: 'hsl(40, 10%, 97%)',        // Warm off-white canvas
      surface: 'hsl(40, 8%, 99%)',            // Slightly warmer white surfaces
      textPrimary: 'hsl(212, 84%, 7%)',       // Near-black text
      textSecondary: 'hsl(215, 16%, 47%)',    // Medium grey text
      textTertiary: 'hsl(215, 20%, 65%)',     // Light grey text
      accent: 'hsl(221, 83%, 53%)',           // Professional blue
      accentOn: 'hsl(0, 0%, 100%)',           // White on accent
      border: 'hsl(40, 10%, 90%)',            // Warm grey borders
      focus: 'hsl(221, 83%, 53%)',            // Match accent for focus
    },
    effects: {
      glassBg: 'rgba(255, 255, 255, 0.7)',    // More opaque for neumorphism
      glassBorder: 'rgba(255, 255, 255, 0.9)', // Near-solid border
      glassBlur: '8px',                        // Less blur, more solid
      warpDistortion: '4',                     // Minimal distortion
      // Neumorphic shadow effects
      neumorphicRaised: '6px 6px 12px rgba(0,0,0,0.06), -6px -6px 12px rgba(255,255,255,0.9)',
      neumorphicInset: 'inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.7)',
    },
  },
} as const;

/**
 * Resolves the complete theme for a given mode
 * by merging base tokens with mode-specific overrides
 */
export function resolveTheme(mode: 'public' | 'business'): Theme {
  const modeOverrides = modes[mode];
  
  return {
    colors: { ...base.colors, ...modeOverrides.colors },
    elevation: base.elevation,
    radii: base.radii,
    spacing: base.spacing,
    effects: { ...base.effects, ...modeOverrides.effects },
  };
}

/**
 * Export base theme for direct access
 */
export const theme = base;
