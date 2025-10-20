import { useEffect } from 'react';
import { useAppMode } from '@/contexts/AppModeContext';
import { resolveTheme } from './theme';

/**
 * ThemeInjector – Hydrates CSS variables from theme system
 * 
 * Injects theme tokens as CSS custom properties on the document root
 * whenever the app mode changes. This ensures all components have access
 * to the current theme values through CSS variables.
 * 
 * Mount this component at the top level of your app (App.tsx or MainLayout)
 * before any children that depend on theme variables.
 */
export function ThemeInjector() {
  const { mode } = useAppMode();

  useEffect(() => {
    // Resolve the complete theme for the current mode
    const theme = resolveTheme(mode);
    const root = document.documentElement;
    const body = document.body;

    // Set data-theme attribute for variant selectors
    body.setAttribute('data-theme', mode);
    body.setAttribute('data-mode', mode); // Legacy support

    // ===== Color Tokens =====
    root.style.setProperty('--background', theme.colors.background);
    root.style.setProperty('--surface', theme.colors.surface);
    root.style.setProperty('--surface-raised', theme.colors.surface); // Cards elevated above surface
    root.style.setProperty('--text-primary', theme.colors.textPrimary);
    root.style.setProperty('--text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--text-tertiary', theme.colors.textTertiary);
    root.style.setProperty('--accent', theme.colors.accent);
    root.style.setProperty('--accent-on', theme.colors.accentOn);
    root.style.setProperty('--border', theme.colors.border);
    root.style.setProperty('--focus', theme.colors.focus);

    // Legacy color aliases for backward compatibility
    root.style.setProperty('--text-ink', theme.colors.textPrimary);
    root.style.setProperty('--text-ink-d', theme.colors.textPrimary);

    // ===== Elevation Tokens (Shadow Strings) =====
    root.style.setProperty('--elevation-1', theme.elevation[1]);
    root.style.setProperty('--elevation-2', theme.elevation[2]);
    root.style.setProperty('--elevation-4', theme.elevation[4]);
    root.style.setProperty('--elevation-8', theme.elevation[8]);
    root.style.setProperty('--elevation-16', theme.elevation[16]);
    root.style.setProperty('--elevation-24', theme.elevation[24]);

    // Legacy shadow aliases
    root.style.setProperty('--shadow-md', theme.elevation[4]);
    root.style.setProperty('--shadow-lg', theme.elevation[8]);

    // ===== Radius Tokens =====
    root.style.setProperty('--radius-sm', theme.radii.sm);
    root.style.setProperty('--radius-md', theme.radii.md);
    root.style.setProperty('--radius-lg', theme.radii.lg);
    root.style.setProperty('--radius-xl', theme.radii.xl);

    // Legacy radius alias
    root.style.setProperty('--radius', theme.radii.lg);

    // ===== Spacing Tokens =====
    root.style.setProperty('--spacing-xs', theme.spacing.xs);
    root.style.setProperty('--spacing-sm', theme.spacing.sm);
    root.style.setProperty('--spacing-md', theme.spacing.md);
    root.style.setProperty('--spacing-lg', theme.spacing.lg);
    root.style.setProperty('--spacing-xl', theme.spacing.xl);
    root.style.setProperty('--spacing-2xl', theme.spacing['2xl']);

    // ===== Glass Effect Tokens =====
    root.style.setProperty('--glass-fill', theme.effects.glassBg);
    root.style.setProperty('--glass-border', theme.effects.glassBorder);
    root.style.setProperty('--glass-blur', theme.effects.glassBlur);
    root.style.setProperty('--glass-refraction-blur', '6px'); // Static for now
    root.style.setProperty('--glass-displace', String(theme.effects.warpDistortion));
    
    // Glass enhancement multipliers
    root.style.setProperty('--glass-vibrancy', '1.15');
    root.style.setProperty('--glass-bright', '1.06');

    // Log theme changes in development
    if (import.meta.env.DEV) {
      console.log(`[ThemeInjector] Applied ${mode} theme:`, theme);
      console.log(`[ThemeInjector] --background value:`, theme.colors.background);
    }
  }, [mode]);

  // This component doesn't render anything
  return null;
}
