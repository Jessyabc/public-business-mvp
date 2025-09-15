# Navigation Audit Report

## Overview
This document summarizes the navigation cleanup and reorganization completed for the brainstorm platform.

## Changes Made

### 1. Canonical Brainstorm Route
- **Consolidated** all brainstorm functionality into single route: `/brainstorm`
- **Created** new brainstorm feature under `src/features/brainstorm/`
- **Implemented** glassmorphism design system throughout
- **Added** right sidebar with feeds (empty states until backend connected)

### 2. Legacy Route Cleanup
- **Deprecated** `/brainstorms` (multiple brainstorms list)
- **Deprecated** `/brainstorms/new` (create form)
- **Deprecated** `/brainstorms/:id` (detail view)  
- **Deprecated** `/brainstorms/:id/edit` (edit form)
- **Added** redirects from legacy routes to canonical `/brainstorm`

### 3. Right Sidebar Implementation
- **Added** authenticated user sidebar with 4 tabs:
  - Brainstorm Feed
  - Business Feed  
  - Open Ideas Feed
  - History
- **Implemented** empty states for all feeds (backend not connected)
- **Added** feature flag `SHOW_RIGHT_SIDEBAR` (default: true)

### 4. Info Pages Integration
- **Created** InfoDrawer component for authenticated topbar
- **Accessible** via "Info" button in header
- **Categorized** info pages: Getting Started, Community, Support, Legal
- **Linked** from footer for unauthenticated users

### 5. Navigation Structure

#### Authenticated Users
- **Main Dashboard** (`/`) - Mode-based feed display
- **Brainstorm Canvas** (`/brainstorm`) - Interactive graph interface
- **Business Feed** (`/business/feed`) - Business insights
- **Open Ideas** (`/open-ideas`) - Community idea bank
- **Info Pages** - Accessible via drawer

#### Unauthenticated Users  
- **Landing Page** - Marketing and onboarding
- **Open Ideas Submit** (`/open-ideas/new`) - Anonymous submission
- **Info Pages** - Direct links and footer access
- **Authentication** (`/auth`) - Sign up/in

### 6. Feature Flags
- `SHOW_RIGHT_SIDEBAR` - Controls sidebar visibility
- `BRAINSTORM_WRITES_ENABLED` - Controls data persistence (currently false)

### 7. Empty States
All features show appropriate empty states with messaging:
- "No data yet — connect backend"
- "Backend not connected — cannot persist"

## File Structure

### New Files Created
```
src/features/brainstorm/
├── BrainstormPage.tsx
├── types.ts
├── store.ts
├── adapters/supabaseAdapter.ts
└── components/
    ├── GraphCanvas.tsx
    ├── Toolbar.tsx
    └── NodeForm.tsx

src/components/layout/
├── RightSidebar.tsx
└── InfoDrawer.tsx

src/adapters/
└── feedsAdapter.ts

public/
└── sitemap-app.json

docs/
└── nav-audit.md
```

### Modified Files
- `src/app/router.tsx` - Updated routing with redirects
- `src/components/layout/Header.tsx` - Added InfoDrawer
- `src/pages/IdeaDetail.tsx` - Fixed default export

## Security & Performance

### Security
- All user input sanitized before display
- Honeypot protection on forms
- Feature flags prevent unauthorized persistence
- Empty states prevent data leakage

### Performance  
- Lazy loading for brainstorm page and sidebar
- Glassmorphism optimized for 60fps
- Debounced form submissions
- Efficient state management with Zustand

## Browser Compatibility
- Backdrop-filter support for glassmorphism
- Fallback styles for unsupported browsers
- Mobile-responsive design throughout

## Next Steps
1. Connect backend adapters to Supabase
2. Enable `BRAINSTORM_WRITES_ENABLED` flag
3. Implement real-time updates for feeds
4. Add analytics tracking for user interactions
5. Consider adding more sophisticated graph layout algorithms

## Testing Checklist
- [x] All routes accessible
- [x] Legacy redirects working
- [x] Empty states displayed properly
- [x] Mobile responsive design
- [x] Glassmorphism styling consistent
- [x] Feature flags operational
- [x] No TypeScript errors
- [x] No console warnings