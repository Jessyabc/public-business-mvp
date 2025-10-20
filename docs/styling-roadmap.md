# Styling Architecture & Roadmap

## Overview
This document outlines the styling system architecture, custom utilities, and design token usage across the application.

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
