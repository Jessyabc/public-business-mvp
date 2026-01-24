

## Fix for Persistent "Loading..." on Published Site

### Problem Summary
The published site (`publicbusiness.lovable.app`) is stuck on "Loading..." permanently, while the preview works correctly. This indicates the JavaScript bundle isn't executing on the published site.

### Diagnosis
- The static HTML "Loading..." from `index.html` never gets replaced by React
- Both auth timeout (8s) and Index page timeout (12s) safety mechanisms aren't triggering
- This means the JavaScript either isn't loading or has a runtime error before React can mount

### Solution Plan

#### Phase 1: Force Clean Rebuild
Trigger a fresh publish to regenerate the production bundle. This resolves most deployment caching issues.

#### Phase 2: Add Defensive Error Handling (if Phase 1 doesn't help)
Add try-catch around the initial React mount to catch any initialization errors:

**File: `src/main.tsx`**
- Wrap `createRoot().render()` in a try-catch
- Display an error message if initialization fails
- Add console logging for debugging

```typescript
try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error('Failed to mount app:', error);
  rootElement.innerHTML = '<div style="padding: 20px; color: red;">App failed to load. Please refresh.</div>';
}
```

#### Phase 3: Reduce Timeout for Faster Recovery
Reduce the auth timeout from 8 seconds to 5 seconds to fail faster if there's a network issue:

**File: `src/contexts/AuthContext.tsx`**
- Change timeout from 8000ms to 5000ms

**File: `src/pages/Index.tsx`**  
- Change timeout from 12000ms to 8000ms

### Immediate Action Required
**Try republishing your app first.** The preview working confirms the code is correct - this is likely a deployment cache issue.

If a fresh publish doesn't fix it, we'll implement Phase 2 and 3 to add better error handling.

### Technical Details

| File | Change |
|------|--------|
| `src/main.tsx` | Add try-catch around React mount |
| `src/contexts/AuthContext.tsx` | Reduce timeout from 8s to 5s |
| `src/pages/Index.tsx` | Reduce timeout from 12s to 8s |

