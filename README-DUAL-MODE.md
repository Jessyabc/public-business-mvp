# Dual-Mode App Shell Documentation

This document explains the dual-mode architecture implemented in Public Business and how the current app shell (`src/app/`) is organized.

## App Shell Overview

- `src/app/NewApp.tsx` – wraps the router with providers (query client, tooltips, auth, etc.) and ensures the UI mode is applied to the document body.
- `src/app/router.tsx` – defines all routes with `react-router-dom`, handling lazy loading, redirects, and the shared `MainLayout` wrapper.

When updating the app shell, make sure `NewApp.tsx` exports the component that Vite mounts and that any new routes are registered in `router.tsx`.

## Design Tokens

Design tokens are centralized in `src/ui/theme/tokens.ts`:

- **Spacing Scale**: Consistent spacing values (xs, sm, md, lg, xl, 2xl, 3xl)
- **Border Radius**: Rounded corner values (sm, md, lg, xl, 2xl, full)
- **Shadows**: Depth system from subtle to prominent, including glass effects
- **Z-Index**: Layering system for overlays and UI elements
- **Mode-Specific Gradients**: Different backgrounds for Public and Business modes

### Usage Example:
```typescript
import { tokens } from '@/ui/theme/tokens';

// Use in components
className={`p-${tokens.spacing.md} rounded-${tokens.radii.lg}`}
```

## Route Groups

The app is organized into distinct route groups:

### Primary Routes
- `/` – Main feed rendered inside `MainLayout`.
- `/brainstorm` – Canonical brainstorm experience (lazy loaded).
- `/landing` – Public-facing marketing page.
- `/open-ideas`, `/open-ideas/new`, `/idea/:id` – Open idea flow (all lazy loaded).
- `/admin`, `/demo/cards`, `/dev/sitemap` (dev only) – Additional internal pages registered in the router.

### Redirects & Legacy Support
- Several `/brainstorms*` paths redirect to `/` or `/brainstorm` to keep legacy URLs functional.
- Navigation items from `src/nav-items.tsx` are automatically wrapped with `MainLayout` for compatibility.

## How to Add a New Page (and Optional Tab)

### 1. Create the Page Component

Place the new page in `src/pages/YourPage.tsx` so it can be lazy loaded by the router:

```typescript
// Example: src/pages/Analytics.tsx
import { GlassCard } from '@/ui/components/GlassCard';

export default function Analytics() {
  return (
    <div className="space-y-6 pt-8">
      <GlassCard>
        <h1>Analytics</h1>
        {/* Your content */}
      </GlassCard>
    </div>
  );
}
```

### 2. Register the Route

Update `src/app/router.tsx` to lazy load and mount the new page inside `MainLayout`:

```typescript
// Add lazy import near the other page imports
const Analytics = lazy(() => import('@/pages/Analytics'));

// Register the route inside the routes array
{
  path: '/analytics',
  element: (
    <MainLayout>
      <LazyWrapper>
        <Analytics />
      </LazyWrapper>
    </MainLayout>
  ),
},
```

### 3. Update Navigation (Optional)

If the page should appear in the authenticated bottom navigation, edit `src/components/navigation/BottomNavigation.tsx`:

```typescript
import { BarChart3 } from 'lucide-react';

const navItems = [
  // ...existing items
  { to: '/analytics', icon: BarChart3, label: 'Analytics', badge: null },
];
```

For marketing or legacy navigation links, also update `src/nav-items.tsx` as needed.

### 4. Update Default Route (Optional)

To change the remembered tab per mode, adjust `lastVisitedTab` in `src/stores/uiModeStore.ts`:

```typescript
lastVisitedTab: {
  public: '/',
  business: '/business-dashboard',
},
```

## UI Mode Store

The global state is managed by Zustand in `src/stores/uiModeStore.ts`:

### State Properties:
- `uiMode`: Current mode ('public' | 'business')
- `lastVisitedTab`: Remembers last visited tab per mode
- `setUiMode()`: Switch between modes
- `setLastVisitedTab()`: Track navigation

### Features:
- **Persistence**: State survives page reloads via localStorage
- **Body Attribute**: Automatically sets `data-mode` attribute for CSS styling
- **Route Memory**: Remembers where you were in each mode

### Usage:
```typescript
import { useUIModeStore } from '@/stores/uiModeStore';

function MyComponent() {
  const { uiMode, setUiMode } = useUIModeStore();
  
  return (
    <button onClick={() => setUiMode('business')}>
      Switch to Business Mode
    </button>
  );
}
```

## Glass Card Component

Centralized glass morphism component at `src/ui/components/GlassCard.tsx`:

### Props:
- `asChild`: Use as Slot for composition
- `padding`: none | sm | md | lg
- `hover`: Enable hover effects (default: true)

### Usage:
```typescript
import { GlassCard } from '@/ui/components/GlassCard';

// Basic usage
<GlassCard>
  <p>Content with glass effect</p>
</GlassCard>

// With custom padding and no hover
<GlassCard padding="lg" hover={false}>
  <div>Static content</div>
</GlassCard>

// As a button (asChild + Slot pattern)
<GlassCard asChild>
  <button onClick={handleClick}>
    Clickable glass card
  </button>
</GlassCard>
```

## Page Layout Component

Consistent page wrapper at `src/ui/layouts/Page.tsx`:

### Props:
- `maxWidth`: Container max width (sm | md | lg | xl | full)
- `padding`: Page padding (none | sm | md | lg)

### Features:
- Mode-aware background gradients (via CSS data-mode attribute)
- Responsive container
- Smooth transitions between modes

## Mock Services

Development-friendly mock data in `src/services/mock/index.ts`:

### Available Services:
- `profileService`: User profiles and membership data
- `brainstormService`: Brainstorms, branches, and creation
- `reportService`: Business reports with filtering
- `notificationService`: User notifications

### Features:
- **LocalStorage Persistence**: Data survives page reloads
- **Realistic Data**: Structured like real API responses
- **No External Dependencies**: Works offline
- **Easy Replacement**: Switch to real APIs by updating imports

### Usage:
```typescript
import { brainstormService } from '@/services/mock';

// Get all brainstorms
const brainstorms = brainstormService.listBrainstorms();

// Create new brainstorm
const newBrainstorm = brainstormService.createBrainstorm('My idea', parentId);

// Get specific brainstorm
const brainstorm = brainstormService.getBrainstorm(id);
```

## Loading States & Error Handling

### Skeleton Components
- `Skeleton`: Individual skeleton with configurable lines and avatar
- `SkeletonList`: Multiple skeletons for list views

### Error Boundaries
- `ErrorBoundary`: React error boundary with retry functionality
- Wrap page content or provider trees manually (e.g., around `MainLayout` children)
- Customizable fallback components

### Usage Pattern:
```typescript
// In your components
const [loading, setLoading] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => {
    // Simulate minimum loading time of 300ms
    const data = mockService.getData();
    setData(data);
    setLoading(false);
  }, 300);
  
  return () => clearTimeout(timer);
}, []);

if (loading) {
  return <SkeletonList count={3} />;
}
```

## CSS Mode Switching

The app uses CSS custom properties and data attributes for theming:

### Body Attribute:
```css
body[data-mode="public"] {
  /* Public mode styles */
}

body[data-mode="business"] {
  /* Business mode styles */
}
```

### Glass Effects:
- `.glass-card`: Default public mode glass
- `.glass-business-card`: Business mode glass with different opacity/colors

### Automatic Updates:
Mode switching automatically updates the body `data-mode` attribute, triggering CSS transitions.

## Performance Considerations

### Code Splitting:
- All page components are lazy loaded through `router.tsx`
- Feature-focused routes keep bundles small without mode-specific directories
- Shared components load only when referenced

### Loading Strategy:
- Minimum 300ms loading time for better UX
- Skeleton placeholders during loading
- Error boundaries prevent crashes

### State Management:
- Zustand for minimal bundle size
- LocalStorage persistence without hydration issues
- Selective re-renders

## Migration from Old Structure

The new shell coexists with the existing app:

1. **Gradual Migration**: Old routes still work via `nav-items.tsx`
2. **Feature Flags**: Can switch between old and new app
3. **Shared Components**: UI components work in both structures
4. **Data Compatibility**: Mock services match expected API structure

To fully migrate, replace `App.tsx` imports with `NewApp.tsx` and update routing as needed.