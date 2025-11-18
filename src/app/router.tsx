import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import Index from '@/pages/Index';
import { LazyWrapper, LoadingFallback, NotFound } from './router-helpers';
import { RequireOrg } from '@/features/orgs/components/RequireOrg';

// Canonical brainstorm pages
const BrainstormFeed = lazy(() => import('@/pages/brainstorm/BrainstormFeed'));

// Pages we actually render
const IdeaDetail = lazy(() => import('@/pages/IdeaDetail'));
const OpenIdeas = lazy(() => import('@/pages/OpenIdeas'));
const OpenIdeaNew = lazy(() => import('@/pages/OpenIdeaNew'));
const Admin = lazy(() => import('@/pages/Admin'));
const DemoCards = lazy(() => import('@/pages/DemoCards'));
const DevSitemap = lazy(() => import('@/pages/DevSitemap'));
const Customize = lazy(() => import('@/pages/Customize'));
const Insights = lazy(() => import('@/pages/Insights'));
const CreateOrganization = lazy(() => import('@/features/orgs/pages/CreateOrganization'));

// Public/landing
import { Landing } from '@/pages/Landing';

// Nav items (kept for compatibility)
import { navItems } from '@/nav-items';

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
        <LazyWrapper><BrainstormFeed /></LazyWrapper>
      </MainLayout>
    ),
  },
  {
    path: '/brainstorm/feed',
    element: (
      <LazyWrapper><BrainstormFeed /></LazyWrapper>
    ),
  },

  // Business insights feed (requires org)
  {
    path: '/app/insights',
    element: (
      <MainLayout>
        <RequireOrg>
          <LazyWrapper><Insights /></LazyWrapper>
        </RequireOrg>
      </MainLayout>
    ),
  },

  // Organization creation
  {
    path: '/org/new',
    element: (
      <MainLayout>
        <LazyWrapper><CreateOrganization /></LazyWrapper>
      </MainLayout>
    ),
  },

  // Legacy brainstorm redirects (no need to lazy-import those old pages)
  { path: '/brainstorm-v2', element: <Navigate to="/brainstorm" replace /> },
  { path: '/brainstorms', element: <Navigate to="/" replace /> },
  { path: '/brainstorms/:id', element: <Navigate to="/" replace /> },
  { path: '/brainstorms/:id/edit', element: <Navigate to="/" replace /> },
  { path: '/brainstorms/new', element: <Navigate to="/" replace /> },
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
  {
    path: '/customize',
    element: (
      <MainLayout>
        <LazyWrapper><Customize /></LazyWrapper>
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

  { path: '/feed', element: <Navigate to="/" replace /> },
{ path: '/public/feed', element: <Navigate to="/" replace /> },


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
