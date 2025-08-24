# Dual-Mode App Shell Documentation

This document explains the dual-mode architecture implemented in Public Business.

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

### Public Mode (`/public/*`)
- `/public/profile` - User profile and activity history
- `/public/brainstorms` - List of all brainstorms
- `/public/brainstorms/:id` - Detailed brainstorm with branches
- `/public/notifications` - User notifications

### Business Mode (`/business/*`)
- `/business/dashboard` - Business metrics and overview
- `/business/reports` - Published reports and insights
- `/business/notifications` - Business-related notifications

### Shared Routes
- Notifications component is shared between modes
- Landing page for unauthenticated users
- Legacy routes maintained for compatibility

## How to Add a New Tab Per Mode

### 1. Create the Page Component

Create your component in the appropriate folder:
- Public mode: `src/app/public/YourPage.tsx`
- Business mode: `src/app/business/YourPage.tsx`
- Shared: `src/app/shared/YourPage.tsx`

```typescript
// Example: src/app/public/Analytics.tsx
import { GlassCard } from '@/ui/components/GlassCard';

export function PublicAnalytics() {
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

### 2. Add Lazy Loading to Router

Update `src/app/router.tsx`:

```typescript
// Add lazy import
const PublicAnalytics = lazy(() => import('./public/Analytics').then(m => ({ default: m.PublicAnalytics })));

// Add route
{
  path: 'analytics',
  element: (
    <LazyWrapper>
      <PublicAnalytics />
    </LazyWrapper>
  ),
}
```

### 3. Update Bottom Navigation

Modify `src/app/shell/AdaptiveBottomBar.tsx`:

```typescript
import { Analytics } from 'lucide-react';

const publicTabs = [
  { icon: User, label: 'Profile', to: '/public/profile' },
  { icon: Brain, label: 'Brainstorms', to: '/public/brainstorms' },
  { icon: Analytics, label: 'Analytics', to: '/public/analytics' }, // New tab
  { icon: Bell, label: 'Notifications', to: '/public/notifications' },
];
```

### 4. Update Default Route (Optional)

If you want the new page as default, update `src/stores/uiModeStore.ts`:

```typescript
lastVisitedTab: {
  public: '/public/analytics', // Changed from /public/profile
  business: '/business/dashboard',
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
- Wraps all routed content in `MainShell`
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
- All page components are lazy loaded
- Routes are split by mode (public/business)
- Shared components loaded only when needed

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