import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Index from '@/pages/Index';

// New idea and brainstorm components  
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

export const router = createBrowserRouter([
  // Main feed route (shows BrainstormFeed/BusinessFeed based on mode)
  {
    path: '/',
    element: <Index />,
  },
  
  // Brainstorm feed route
  {
    path: '/brainstorm',
    element: <Index />,
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
  {
    path: '/brainstorms',
    element: (
      <MainLayout>
        <LazyWrapper><Brainstorms /></LazyWrapper>
      </MainLayout>
    ),
  },
  {
    path: '/brainstorms/new',
    element: (
      <MainLayout>
        <LazyWrapper><BrainstormNew /></LazyWrapper>
      </MainLayout>
    ),
  },
  {
    path: '/brainstorms/:id',
    element: (
      <MainLayout>
        <LazyWrapper><BrainstormDetailPage /></LazyWrapper>
      </MainLayout>
    ),
  },
  {
    path: '/brainstorms/:id/edit',
    element: (
      <MainLayout>
        <LazyWrapper><BrainstormEdit /></LazyWrapper>
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
]);
