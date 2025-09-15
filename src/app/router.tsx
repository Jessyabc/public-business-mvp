import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Index from '@/pages/Index';

// Canonical brainstorm page
const BrainstormPage = lazy(() => import('@/features/brainstorm/BrainstormPage'));

// Legacy pages (to be redirected)
const IdeaDetail = lazy(() => import('@/pages/IdeaDetail'));
const BrainstormNew = lazy(() => import('@/pages/BrainstormNew'));
const BrainstormDetailPage = lazy(() => import('@/pages/BrainstormDetail'));
const BrainstormEdit = lazy(() => import('@/pages/BrainstormEdit'));
const Brainstorms = lazy(() => import('@/pages/Brainstorms'));
const OpenIdeas = lazy(() => import('@/pages/OpenIdeas'));
const OpenIdeaNew = lazy(() => import('@/pages/OpenIdeaNew'));
const Admin = lazy(() => import('@/pages/Admin'));

// Keep existing pages for non-shell routes
import { Landing } from '@/pages/Landing';
import { navItems } from '@/nav-items';

// Fallback component for loading
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner />
    </div>
  );
}

// Wrapper for lazy components
function LazyWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

const DemoCards = lazy(() => import('@/pages/DemoCards'));
const DevSitemap = lazy(() => import('@/pages/DevSitemap'));

export const router = createBrowserRouter([
  // Main feed route (shows BrainstormFeed/BusinessFeed based on mode)
  {
    path: '/',
    element: <Index />,
  },
  
  // Canonical brainstorm route
  {
    path: '/brainstorm',
    element: (
      <MainLayout>
        <LazyWrapper><BrainstormPage /></LazyWrapper>
      </MainLayout>
    ),
  },

  // Legacy brainstorm redirects
  {
    path: '/brainstorm-v2',
    element: <Navigate to="/brainstorm" replace />,
  },
  {
    path: '/brainstorms/canvas',
    element: <Navigate to="/brainstorm" replace />,
  },

  // Landing page and public routes (outside shell)  
  {
    path: '/landing',
    element: (
      <MainLayout>
        <Landing />
      </MainLayout>
    ),
  },
  {
    path: '/idea/:id',
    element: (
      <MainLayout>
        <LazyWrapper><IdeaDetail /></LazyWrapper>
      </MainLayout>
    ),
  },
  // Legacy brainstorm routes - redirect to canonical
  {
    path: '/brainstorms',
    element: <Navigate to="/brainstorm" replace />,
  },
  {
    path: '/brainstorms/new',
    element: <Navigate to="/brainstorm" replace />,
  },
  {
    path: '/brainstorms/:id',
    element: <Navigate to="/brainstorm" replace />,
  },
  {
    path: '/brainstorms/:id/edit', 
    element: <Navigate to="/brainstorm" replace />,
  },
  {
    path: '/open-ideas',
    element: (
      <MainLayout>
        <LazyWrapper><OpenIdeas /></LazyWrapper>
      </MainLayout>
    ),
  },
  {
    path: '/open-ideas/new',
    element: (
      <MainLayout>
        <LazyWrapper><OpenIdeaNew /></LazyWrapper>
      </MainLayout>
    ),
  },
  {
    path: '/admin',
    element: (
      <MainLayout>
        <LazyWrapper><Admin /></LazyWrapper>
      </MainLayout>
    ),
  },
  
  // Keep existing routes from nav-items for compatibility - wrap all with MainLayout
  ...navItems.map(({ to, page }) => ({
    path: to,
    element: <MainLayout>{page}</MainLayout>,
  })),
  
  // Demo route for PostCard showcase
  {
    path: '/demo/cards',
    element: (
      <MainLayout>
        <LazyWrapper><DemoCards /></LazyWrapper>
      </MainLayout>
    ),
  },

  // Dev sitemap (development only)
  {
    path: '/dev/sitemap',
    element: (
      <MainLayout>
        <LazyWrapper><DevSitemap /></LazyWrapper>
      </MainLayout>
    ),
  },
]);
