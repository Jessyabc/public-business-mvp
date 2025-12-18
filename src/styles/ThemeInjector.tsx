import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveTheme } from './theme';
import { useDiscussLensSafe } from '@/contexts/DiscussLensContext';

/**
 * ThemeInjector – Hydrates CSS variables from theme system
 * 
 * Route-aware theming:
 * - Workspace (/): Always uses 'public' theme (dark, focused)
 * - Discuss (/discuss): Respects lens (public/business)
 * - Other routes: Default to 'public'
 */

interface ThemeSettings {
  colors?: Record<string, string>;
  radii?: Record<string, string>;
  elevation?: Record<number, string>;
  effects?: Record<string, string>;
}

interface ModeThemeSettings {
  public: ThemeSettings;
  business: ThemeSettings;
}

export function ThemeInjector() {
  const location = useLocation();
  const { lens } = useDiscussLensSafe();
  const [currentTheme, setCurrentTheme] = useState<'public' | 'business'>('public');

  // Determine theme based on route
  useEffect(() => {
    if (location.pathname.startsWith('/discuss')) {
      setCurrentTheme(lens);
    } else {
      // Workspace and other routes use public theme
      setCurrentTheme('public');
    }
  }, [location.pathname, lens]);

  useEffect(() => {
    // Load custom theme from localStorage
    const stored = localStorage.getItem('theme-customization');
    const customSettings = stored ? JSON.parse(stored) as ModeThemeSettings : null;
    const customTheme = customSettings?.[currentTheme] || {};

    // Resolve default theme for current mode
    const defaultTheme = resolveTheme(currentTheme);

    // Merge custom values with defaults (custom overrides default)
    const mergedTheme = {
      colors: { ...defaultTheme.colors, ...(customTheme.colors || {}) },
      radii: { ...defaultTheme.radii, ...(customTheme.radii || {}) },
      elevation: { ...defaultTheme.elevation, ...(customTheme.elevation || {}) },
      effects: { ...defaultTheme.effects, ...(customTheme.effects || {}) },
      spacing: defaultTheme.spacing,
    };

    const root = document.documentElement;
    const body = document.body;

    // Set data-theme attribute for variant selectors
    body.setAttribute('data-theme', currentTheme);
    body.setAttribute('data-mode', currentTheme); // Legacy support

    // ===== Color Tokens =====
    root.style.setProperty('--background', mergedTheme.colors.background);
    root.style.setProperty('--surface', mergedTheme.colors.surface);
    root.style.setProperty('--surface-raised', mergedTheme.colors.surface);
    root.style.setProperty('--text-primary', mergedTheme.colors.textPrimary);
    root.style.setProperty('--text-secondary', mergedTheme.colors.textSecondary);
    root.style.setProperty('--text-tertiary', mergedTheme.colors.textTertiary);
    root.style.setProperty('--accent', mergedTheme.colors.accent);
    root.style.setProperty('--accent-on', mergedTheme.colors.accentOn);
    root.style.setProperty('--border', mergedTheme.colors.border);
    root.style.setProperty('--focus', mergedTheme.colors.focus);

    // Legacy color aliases
    root.style.setProperty('--text-ink', mergedTheme.colors.textPrimary);
    root.style.setProperty('--text-ink-d', mergedTheme.colors.textPrimary);

    // ===== Elevation Tokens =====
    root.style.setProperty('--elevation-1', mergedTheme.elevation[1]);
    root.style.setProperty('--elevation-2', mergedTheme.elevation[2]);
    root.style.setProperty('--elevation-4', mergedTheme.elevation[4]);
    root.style.setProperty('--elevation-8', mergedTheme.elevation[8]);
    root.style.setProperty('--elevation-16', mergedTheme.elevation[16]);
    root.style.setProperty('--elevation-24', mergedTheme.elevation[24]);

    // Legacy shadow aliases
    root.style.setProperty('--shadow-md', mergedTheme.elevation[4]);
    root.style.setProperty('--shadow-lg', mergedTheme.elevation[8]);

    // ===== Radius Tokens =====
    root.style.setProperty('--radius-sm', mergedTheme.radii.sm);
    root.style.setProperty('--radius-md', mergedTheme.radii.md);
    root.style.setProperty('--radius-lg', mergedTheme.radii.lg);
    root.style.setProperty('--radius-xl', mergedTheme.radii.xl);

    // Legacy radius alias
    root.style.setProperty('--radius', mergedTheme.radii.lg);

    // ===== Spacing Tokens =====
    root.style.setProperty('--spacing-xs', mergedTheme.spacing.xs);
    root.style.setProperty('--spacing-sm', mergedTheme.spacing.sm);
    root.style.setProperty('--spacing-md', mergedTheme.spacing.md);
    root.style.setProperty('--spacing-lg', mergedTheme.spacing.lg);
    root.style.setProperty('--spacing-xl', mergedTheme.spacing.xl);
    root.style.setProperty('--spacing-2xl', mergedTheme.spacing['2xl']);

    // ===== Glass Effect Tokens =====
    root.style.setProperty('--glass-fill', mergedTheme.effects.glassBg);
    root.style.setProperty('--glass-border', mergedTheme.effects.glassBorder);
    root.style.setProperty('--glass-blur', mergedTheme.effects.glassBlur);
    root.style.setProperty('--glass-refraction-blur', '6px');
    root.style.setProperty('--glass-displace', String(mergedTheme.effects.warpDistortion));
    
    // Glass enhancement multipliers
    root.style.setProperty('--glass-vibrancy', '1.15');
    root.style.setProperty('--glass-bright', '1.06');

    if (import.meta.env.DEV) {
      console.log(`[ThemeInjector] Applied ${currentTheme} theme`);
    }
  }, [currentTheme]);

  return null;
}
