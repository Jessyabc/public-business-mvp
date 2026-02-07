
## Tailwind v4 Production Build - Complete Fix

### Problems Identified

After thorough investigation, I've identified **three critical issues** causing the styling discrepancy between the editor preview and the published URL:

---

### Issue 1: Missing CSS Import for Glass Effects

**File:** `src/styles/effects.css`

This file defines essential glass morphism classes used throughout the app:
- `.glass-card` (used in 30+ components)
- `.glass-surface`
- `.glass-button`
- `.pb-dock`
- `.scrim`

**The problem:** This file is **NOT imported** in `src/index.css`. Currently only these are imported:
```css
@import "./styles/glass-tiers.css";
@import "./styles/reduced-motion.css";
```

**The fix:** Add the missing import:
```css
@import "./styles/effects.css";
```

---

### Issue 2: Missing CSS Variable `--glass-bg`

**File:** `src/index.css`

The `.glassButton` component class references `var(--glass-bg)`:
```css
.glassButton {
  background: var(--glass-bg);  /* ❌ Not defined in :root */
}
```

However, `:root` only defines `--glass-fill`, not `--glass-bg`. Looking at line 161:
```css
--glass-bg: rgba(8, 19, 40, 0.55);  /* ✓ Actually is defined */
```

This is actually defined, so this is not the issue.

---

### Issue 3: `@source` Directive May Not Scan CSS Files

Tailwind v4's `@source` directive tells the build what files to scan for utility classes:
```css
@source "./**/*.{ts,tsx,js,jsx,mdx}";
```

This **does not include `.css` files**. If custom class names appear only in CSS files (like `effects.css`), they may not be recognized by Tailwind's class detection.

---

## Implementation Plan

### Step 1: Add Missing CSS Import (Critical)

Update `src/index.css` to import the effects stylesheet:

```css
/* Custom CSS modules */
@import "./styles/glass-tiers.css";
@import "./styles/reduced-motion.css";
@import "./styles/effects.css";  /* ADD THIS LINE */
```

### Step 2: Ensure `@source` Includes CSS Files

Update the source scanning to include CSS files:

```css
@source "../index.html";
@source "./**/*.{ts,tsx,js,jsx,mdx,css}";
```

### Step 3: Verify CSS Variable Completeness

Ensure all referenced CSS variables in `effects.css` are defined in `:root`. Cross-check:
- `--glass-fill` - defined
- `--glass-border` - defined
- `--glass-blur` - defined
- `--glass-vibrancy` - defined
- `--glass-bright` - defined
- `--glass-refraction-blur` - defined
- `--text-ink` / `--text-ink-d` - defined
- `--shadow-md` / `--shadow-lg` - defined
- `--radius` - defined
- `--t-fast` / `--ease` - defined
- `--dock-h` / `--dock-gap` - defined

All variables appear to be defined in the `:root` block.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/index.css` | Add `@import "./styles/effects.css"` after existing imports |
| `src/index.css` | Update `@source` to include `.css` extension |

---

## Technical Details

### Why This Works in Development But Not Production

1. **HMR (Hot Module Replacement)**: In development, Vite's HMR may load CSS files through different mechanisms that work around missing imports
2. **CSS Module Resolution**: The CSS module `glassSurface.module.css` is imported directly in components and processed separately by Vite
3. **Build-time Scanning**: Production builds strictly follow the `@import` chain and `@source` directives

### Testing After Fix

1. Verify styling in Lovable preview (should remain unchanged)
2. Republish the application
3. Check the published URL with a hard refresh (`Cmd+Shift+R`)
4. Confirm glass effects, navigation styling, and button states work correctly
