import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Index from '@/pages/Index';

// Canonical brainstorm page
const BrainstormPage = lazy(() => import('@/features/brainstorm/BrainstormPage'));

// Pages we actually render
const IdeaDetail = lazy(() => import('@/pages/IdeaDetail'));
const OpenIdeas = lazy(() => import('@/pages/OpenIdeas'));
const OpenIdeaNew = lazy(() => import('@/pages/OpenIdeaNew'));
const Admin = lazy(() => import('@/pages/Admin'));
const DemoCards = lazy(() => import('@/pages/DemoCards'));
const DevSitemap = lazy(() => import('@/pages/DevSitemap'));

// Public/landing
import { Landing } from '@/pages/Landing';

// Nav items (kept for compatibility)
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

// Simple 404 (client-side)
function NotFound() {
  return (
    <MainLayout>
      <div className="min-h-[50vh] flex items-center justify-center text-center p-8">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
          <p className="text-muted-foreground">
            The page you’re looking for doesn’t exist.{" "}
            <a href="/" className="underline">Go home</a>.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

// Build routes array so we can conditionally add dev-only routes
const routes: Parameters<typeof createBrowserRouter>[0] = [
  // Root (shell)
  {
    path: '/',
    element: (
      <MainLayout>
        <Index />
      </MainLayout>
    ),
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

  // Legacy brainstorm redirects (no need to lazy-import those old pages)
  { path: '/brainstorm-v2', element: <Navigate to="/brainstorm" replace /> },
  { path: '/brainstorms', element: <Navigate to="/brainstorm" replace /> },
  { path: '/brainstorms/:id', element: <Navigate to="/brainstorm" replace /> },
  { path: '/brainstorms/:id/edit', element: <Navigate to="/brainstorm" replace /> },
  { path: '/brainstorms/canvas', element: <Navigate to="/brainstorm" replace /> },

  // Public landing
  {
    path: '/landing',
    element: (
      <MainLayout>
        <Landing />
      </MainLayout>
    ),
  },

  // Other pages we actually render
  {
    path: '/idea/:id',
    element: (
      <MainLayout>
        <LazyWrapper><IdeaDetail /></LazyWrapper>
      </MainLayout>
    ),
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

  // Catch-all 404
  { path: '*', element: <NotFound /> },
];

// Dev sitemap (development only)
if (import.meta.env.DEV) {
  routes.splice(routes.length - 1, 0, {
    path: '/dev/sitemap',
    element: (
      <MainLayout>
        <LazyWrapper><DevSitemap /></LazyWrapper>
      </MainLayout>
    ),
  });
}

export const router = createBrowserRouter(routes);
