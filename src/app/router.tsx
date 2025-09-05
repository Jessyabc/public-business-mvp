import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Index from '@/pages/Index';

// New idea and brainstorm components
const IdeaDetail = lazy(() => import('@/pages/IdeaDetail').then(m => ({ default: m.IdeaDetail })));
const BrainstormNew = lazy(() => import('@/pages/BrainstormNew').then(m => ({ default: m.BrainstormNew })));
const BrainstormDetailPage = lazy(() => import('@/pages/BrainstormDetail').then(m => ({ default: m.BrainstormDetail })));
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
    path: '/brainstorm/new',
    element: (
      <MainLayout>
        <LazyWrapper><BrainstormNew /></LazyWrapper>
      </MainLayout>
    ),
  },
  {
    path: '/brainstorm/:id',
    element: (
      <MainLayout>
        <LazyWrapper><BrainstormDetailPage /></LazyWrapper>
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
]);
