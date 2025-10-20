# Styling Architecture & Roadmap

## Overview
This document explains the new theme system architecture, how it works, and how to extend or temporarily disable it.

---

## Theme System Architecture

### 1. Theme Token Centralization (`src/styles/theme.ts`)

**Purpose:** Single source of truth for all design tokens across modes.

The `theme.ts` file exports:
- `publicTheme` - Tokens for public-facing pages
- `businessTheme` - Tokens for business dashboard
- `resolveTheme(mode)` - Function that returns the appropriate theme

**Token Structure:**
```typescript
{
  colors: {
    background: 'hsl(...)',
    surface: 'hsl(...)',
    textPrimary: 'hsl(...)',
    textSecondary: 'hsl(...)',
    accent: 'hsl(...)',
    border: 'hsl(...)',
    // ... more colors
  },
  radii: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  elevations: {
    1: '0 1px 2px rgba(0,0,0,0.05)',
    4: '0 4px 6px rgba(0,0,0,0.1)',
    // ... up to 24
  }
}
```

### 2. Theme Hydration (`src/styles/ThemeInjector.tsx`)

**Purpose:** Converts JavaScript theme tokens into CSS custom properties at runtime.

**How it works:**
1. Reads current `uiMode` from the store
2. Calls `resolveTheme(uiMode)` to get theme object
3. Injects CSS variables into the document root:
   ```javascript
   document.documentElement.style.setProperty('--background', theme.colors.background);
   document.documentElement.style.setProperty('--surface', theme.colors.surface);
   // ... etc
   ```
4. Logs theme to console for debugging
5. Re-runs whenever `uiMode` changes

**Where to use it:**
ThemeInjector is already mounted in `src/main.tsx` and runs automatically. You don't need to import it elsewhere.

### 3. Consuming Theme Tokens

**In Components (Inline Styles):**
```tsx
<div style={{ 
  background: 'var(--background)', 
  color: 'var(--text-primary)' 
}}>
  Content
</div>
```

**In CSS Files:**
```css
.my-component {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-primary);
}
```

**Critical Rule:** Never use direct Tailwind color classes like `bg-blue-500` or `text-white`. Always use theme variables.

---

## Design Token System

### Color System
All colors are defined using HSL format in `src/index.css` and referenced via CSS custom properties.

**Critical Rule:** Never use direct color classes like `text-white`, `bg-blue-500`, etc. Always use semantic tokens:
- `--background` - Main background color
- `--surface` - Card/panel surfaces
- `--text-primary` - Primary text color
- `--text-secondary` - Secondary text color
- `--accent` - Accent/brand color
- `--border` - Border colors

### Theme Configuration
Theme tokens are defined in:
- `src/styles/theme.ts` - Theme resolver and mode-specific values
- `src/index.css` - CSS custom property definitions
- `tailwind.config.js` - Tailwind integration

---

## Custom Tailwind Utilities

### 1. Elevation System
**Plugin:** `elevationPlugin` in `tailwind.config.js`

Generates `elevation-1` through `elevation-24` classes that use dynamic CSS variables.

```tsx
// Usage
<div className="elevation-4">Elevated card</div>
<div className="elevation-12">Modal overlay</div>
```

### 2. Responsive Spacing Utilities
**Plugin:** `responsiveSpacingPlugin` in `tailwind.config.js`

Provides two spacing scales optimized for different screen sizes:

#### Space Tight (Mobile-First)
Optimized for mobile devices with tighter spacing:
- `space-tight-xs` → 4px (0.25rem)
- `space-tight-sm` → 8px (0.5rem)
- `space-tight-md` → 12px (0.75rem)
- `space-tight-lg` → 16px (1rem)
- `space-tight-xl` → 20px (1.25rem)

#### Space Normal (Desktop)
Standard spacing for larger screens:
- `space-normal-xs` → 8px (0.5rem)
- `space-normal-sm` → 16px (1rem)
- `space-normal-md` → 24px (1.5rem)
- `space-normal-lg` → 32px (2rem)
- `space-normal-xl` → 48px (3rem)

#### Usage Pattern
Apply tight spacing by default, then override at `md:` breakpoint:

```tsx
// Responsive spacing with flex/grid
<div className="flex space-tight-sm md:space-normal-md">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Grid layout
<div className="grid space-tight-md md:space-normal-lg">
  <Card />
  <Card />
</div>
```

**Best Practice:** Use `space-tight` for mobile (< md breakpoint) and `space-normal` for desktop to maintain optimal density across devices.

---

## Semantic Token Usage

### Background & Surfaces
```tsx
// Main background (uses theme token)
<div style={{ background: 'var(--background)' }}>

// Surface elements (cards, panels)
<div style={{ background: 'var(--surface)' }}>
```

### Text Colors
```tsx
// Primary text
<h1 style={{ color: 'var(--text-primary)' }}>

// Secondary text
<p style={{ color: 'var(--text-secondary)' }}>
```

### Borders & Accents
```tsx
// Borders
<div style={{ borderColor: 'var(--border)' }}>

// Accent elements
<button style={{ background: 'var(--accent)' }}>
```

---

## Migration Guide

### From Legacy Gradients
❌ **Old:**
```tsx
<div className="bg-gradient-to-br from-slate-900 to-slate-800">
```

✅ **New:**
```tsx
<div style={{ background: 'var(--background)' }}>
```

### From Direct Colors
❌ **Old:**
```tsx
<div className="bg-white text-black">
```

✅ **New:**
```tsx
<div style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>
```

### From Fixed Spacing
❌ **Old:**
```tsx
<div className="space-y-4">
```

✅ **New:**
```tsx
<div className="space-tight-sm md:space-normal-md">
```

---

## Adding New Modes or Tokens

### Adding a New Mode

1. **Define the theme in `src/styles/theme.ts`:**
```typescript
export const enterpriseTheme: Theme = {
  colors: {
    background: 'hsl(210, 20%, 12%)',
    surface: 'hsl(210, 18%, 16%)',
    textPrimary: 'hsl(210, 15%, 95%)',
    textSecondary: 'hsl(210, 12%, 75%)',
    accent: 'hsl(280, 70%, 60%)',
    border: 'hsl(210, 15%, 25%)',
  },
  radii: { /* ... */ },
  elevations: { /* ... */ },
};
```

2. **Update `resolveTheme()` function:**
```typescript
export function resolveTheme(mode: string): Theme {
  switch (mode) {
    case 'public': return publicTheme;
    case 'business': return businessTheme;
    case 'enterprise': return enterpriseTheme; // Add here
    default: return publicTheme;
  }
}
```

3. **Update mode store (`src/stores/uiModeStore.ts`):**
```typescript
type UIMode = 'public' | 'business' | 'enterprise';
```

4. **Update Tailwind variants (optional) in `tailwind.config.js`:**
```javascript
addVariant('theme-enterprise', '[data-theme="enterprise"] &');
```

### Adding New Tokens to Existing Themes

1. **Add to theme object in `src/styles/theme.ts`:**
```typescript
export const publicTheme: Theme = {
  colors: {
    // ... existing colors
    success: 'hsl(142, 71%, 45%)',
    warning: 'hsl(38, 92%, 50%)',
    danger: 'hsl(0, 84%, 60%)',
  },
  // ...
};
```

2. **Update ThemeInjector (`src/styles/ThemeInjector.tsx`):**
```typescript
// Add to the injection loop
document.documentElement.style.setProperty('--success', theme.colors.success);
document.documentElement.style.setProperty('--warning', theme.colors.warning);
document.documentElement.style.setProperty('--danger', theme.colors.danger);
```

3. **Use in components:**
```tsx
<Alert style={{ background: 'var(--warning)' }}>Warning message</Alert>
```

---

## Using Built-in Utilities

### Elevation Classes
Generated by `elevationPlugin` in `tailwind.config.js`.

**Available classes:** `elevation-1` through `elevation-24`

```tsx
// Subtle elevation for cards
<Card className="elevation-2">...</Card>

// Medium elevation for modals
<Dialog className="elevation-8">...</Dialog>

// High elevation for tooltips
<Tooltip className="elevation-16">...</Tooltip>
```

Each elevation class applies a dynamic shadow from the current theme's `elevations` object.

### Border Radius Utilities
Defined in theme tokens and exposed via Tailwind config.

**Available classes:**
- `rounded-pb-sm` → 6px (0.375rem)
- `rounded-pb-md` → 8px (0.5rem)
- `rounded-pb-lg` → 12px (0.75rem)
- `rounded-pb-xl` → 16px (1rem)

```tsx
<Card className="rounded-pb-lg">Themed border radius</Card>
```

### Responsive Spacing
See "Responsive Spacing Utilities" section above for `space-tight-*` and `space-normal-*` usage.

---

## Legacy Styles Rollback

### Emergency Rollback

If the new theme system causes issues, you can temporarily restore the old styling system.

**Steps:**

1. **Open `.env` file in project root**

2. **Add this line:**
```env
VITE_ENABLE_LEGACY_STYLES=true
```

3. **Restart the dev server:**
```bash
npm run dev
```

**What this does:**
- Re-enables legacy CSS files (`base.css`, `app-shell.css`, `glass.css`, `postcards.css`)
- Restores old gradient backgrounds
- Restores original glass morphism styles
- Theme token system still runs but legacy styles take precedence

**⚠️ Important Notes:**
- This is a **temporary** fallback, not a permanent solution
- Legacy styles will be removed in future versions
- Use this only to unblock development while reporting issues
- The flag is checked in `src/main.tsx`

### Disabling Legacy Rollback

Once issues are resolved, disable legacy styles:

1. **Remove or comment out in `.env`:**
```env
# VITE_ENABLE_LEGACY_STYLES=true
```

2. **Restart dev server**

---

## Troubleshooting

### Theme tokens not applying
1. Check browser console for ThemeInjector logs
2. Verify `ThemeInjector` is mounted in `src/main.tsx`
3. Inspect element to see if CSS variables are set on `:root`

### Colors look wrong in dark mode
1. Check which theme is active (console logs show current mode)
2. Verify HSL values in `theme.ts` have correct lightness for the mode
3. Ensure components use `var(--text-primary)` not hard-coded colors

### Spacing inconsistent
1. Use `space-tight-*` for mobile, `space-normal-*` for desktop
2. Check if legacy spacing classes (`space-y-4`) are conflicting
3. Apply responsive pattern: `space-tight-sm md:space-normal-md`

### Elevation not visible
1. Verify element has the `elevation-{n}` class
2. Check theme's `elevations` object has correct shadow values
3. Ensure parent doesn't have `overflow: hidden` cutting off shadows

---

## Roadmap

### Phase 1: Foundation (Current)
- ✅ Theme token system
- ✅ Elevation utilities
- ✅ Responsive spacing utilities
- ✅ Legacy CSS isolation

### Phase 2: Component Migration
- [ ] Migrate all components to use semantic tokens
- [ ] Remove direct color classes
- [ ] Apply responsive spacing patterns
- [ ] Audit and update shadcn components

### Phase 3: Enhancement
- [ ] Add animation token system
- [ ] Create spacing composition utilities
- [ ] Add typography scale utilities
- [ ] Implement focus/interaction state tokens

### Phase 4: Polish
- [ ] Complete dark mode refinement
- [ ] Optimize bundle size
- [ ] Document component patterns
- [ ] Create Storybook showcase

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CSS Custom Properties Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- Project theme system: `src/styles/theme.ts`
- Token definitions: `src/index.css`
