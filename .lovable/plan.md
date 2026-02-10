

## Consolidate Tailwind CSS v4 to a Single Integration Path

### The Problem

Right now there are **two conflicting Tailwind integration points**:

1. `postcss.config.js` -- uses `@tailwindcss/postcss`
2. `vite.config.ts` -- does NOT use `@tailwindcss/vite`

The PostCSS path is the one causing production build failures. We need to pick ONE and clean up everything else.

### The Choice: `@tailwindcss/vite` (recommended)

Since this is a Vite project, Tailwind's own docs recommend `@tailwindcss/vite`. It hooks directly into Vite's transform pipeline and avoids the known production build issues with the PostCSS plugin.

### Exactly What Changes

| File | What happens |
|------|-------------|
| `package.json` | Replace `@tailwindcss/postcss` with `@tailwindcss/vite`. Remove `autoprefixer` (handled automatically by the Vite plugin). Keep `postcss` and `tailwindcss`. |
| `vite.config.ts` | Add `import tailwindcss from '@tailwindcss/vite'` and add `tailwindcss()` to the plugins array. |
| `postcss.config.js` | Empty the plugins object -- no Tailwind processing here anymore. |
| `src/index.css` | No changes needed. `@import "tailwindcss"`, `@theme`, `@source` all work identically. |

### File-by-file Details

**package.json** -- dependency swap:
- Remove: `@tailwindcss/postcss`, `autoprefixer`
- Add: `@tailwindcss/vite` (same version `^4.1.18`)

**vite.config.ts** -- add plugin:
```
import tailwindcss from '@tailwindcss/vite';

plugins: [
  tailwindcss(),   // FIRST -- before React
  react(),
  componentTaggerPlugin,
].filter(Boolean),
```

**postcss.config.js** -- gut it:
```
export default {
  plugins: {},
}
```

### Why This Fixes Production

The `@tailwindcss/vite` plugin participates directly in Vite's module graph. It sees every file Vite processes, so it reliably generates all utility classes for both dev and production builds. The PostCSS plugin runs in a separate pass and can miss files, which is why dev (HMR) works but `vite build` drops styles.

### After Implementation

Republish and hard-refresh (`Cmd+Shift+R`) the live URL. All Tailwind utilities and custom glass classes should render correctly.

