

## Fix: Restore Global Tailwind Utility Spacing in Production

### Root Cause

The inline critical CSS in `index.html` line 29 contains an **unlayered CSS reset** that overrides all Tailwind spacing utilities site-wide:

```css
*{box-sizing:border-box;margin:0;padding:0}
```

Because this sits outside any `@layer`, it has higher specificity than Tailwind v4's layered utilities (`space-x-*`, `mx-*`, `px-*`, `py-*`, etc.). This means **any Tailwind class that sets margin or padding can be silently overridden** -- not just in the Header, but everywhere in the app.

The same reset already exists properly inside `@layer base` in `src/index.css`, where it correctly defers to Tailwind utilities. The inline version is redundant and destructive.

### The Fix (1 line change)

**`index.html` line 29** -- remove `margin:0;padding:0` from the inline critical CSS:

```css
/* Before */
*{box-sizing:border-box;margin:0;padding:0}

/* After */
*{box-sizing:border-box}
```

That is the entire fix. No hardcoded styles, no component-level overrides. This restores the correct CSS cascade so that all Tailwind utilities (`space-x-*`, `gap-*`, `p-*`, `m-*`, etc.) work as intended across every component globally.

### Why Only This One Change

- The proper `margin:0; padding:0` reset is already in `src/index.css` inside `@layer base` -- it will continue to apply as a baseline but yield to any Tailwind utility class.
- `box-sizing: border-box` is safe to keep inline because no Tailwind utility ever needs to override it.
- No component files need changes. `space-x-8`, `space-x-4`, etc. in the Header (and everywhere else) will simply start working again.

### After Implementation

Republish and hard-refresh the live site. All spacing, padding, and margin utilities should render correctly across the entire app.

