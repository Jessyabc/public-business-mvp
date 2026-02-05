
## Tailwind v4 Production Build Fix

### Problem Identified

The styling discrepancy between the Lovable editor preview and the published preview URL is caused by **Tailwind v4's `@theme` block incorrectly using `var()` CSS variable references**.

In Tailwind v4, the `@theme` directive tokens are processed **at build time** to generate utility classes. However, the current configuration uses runtime CSS variable references inside `@theme`:

```css
@theme {
  --color-pb-blue: var(--pb-blue);        /* ❌ Runtime reference */
  --color-ink-base: var(--text-primary);  /* ❌ Runtime reference */
  --duration-med: var(--t-med);           /* ❌ Runtime reference */
}
```

This works in the Lovable editor preview (likely due to HMR/dev mode handling) but **fails in production builds** because Tailwind cannot resolve `var()` references at compile time.

### Root Cause

- Tailwind v4 `@theme` tokens must be **static values** (hex colors, pixel values, etc.)
- Using `var(--custom-prop)` inside `@theme` causes the generated utility classes to not compile correctly
- The production CSS bundle ends up with broken/empty utility values

### Solution

Replace `var()` references in `@theme` with static values, then use those `@theme` tokens to define the `:root` CSS variables (reversing the dependency direction).

### Implementation Steps

1. **Fix `@theme` Block** - Use static values directly in `@theme`:
   ```css
   @theme {
     /* Brand - static values */
     --color-pb-blue: #489FE3;
     
     /* Text */
     --color-ink-base: #E6F0FF;
     
     /* Motion */
     --duration-med: 220ms;
   }
   ```

2. **Update `:root` Variables** - Reference `@theme` tokens in runtime variables:
   ```css
   :root {
     --pb-blue: var(--color-pb-blue);
     --text-primary: var(--color-ink-base);
     --t-med: var(--duration-med);
   }
   ```

3. **Verify Component Usage** - Ensure components using `text-ink-base`, `bg-pb-blue`, and `duration-med` work correctly after the fix.

---

### Technical Details

**Files to Modify:**
- `src/index.css` - Fix `@theme` block and `:root` variable order

**Key Changes:**
- Invert the dependency: `@theme` defines static values, `:root` references them
- This ensures Tailwind can generate proper utility classes at build time
- Runtime theming (via ThemeInjector) will still work by overriding the CSS variables

**Testing:**
- Verify styling in Lovable preview
- Republish and check preview URL
- Confirm utility classes like `text-ink-base`, `bg-pb-blue`, `duration-med` render correctly
