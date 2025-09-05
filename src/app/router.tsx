import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainShell } from './shell/MainShell';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Index from '@/pages/Index';

// Lazy load components for code splitting
const PublicProfile = lazy(() => import('./public/Profile').then(m => ({ default: m.PublicProfile })));
const BrainstormsList = lazy(() => import('./public/BrainstormsList').then(m => ({ default: m.BrainstormsList })));
const BrainstormDetail = lazy(() => import('./public/BrainstormDetail').then(m => ({ default: m.BrainstormDetail })));
const BusinessDashboard = lazy(() => import('./business/Dashboard').then(m => ({ default: m.BusinessDashboard })));
const BusinessReports = lazy(() => import('./business/Reports').then(m => ({ default: m.BusinessReports })));
const Notifications = lazy(() => import('./shared/Notifications').then(m => ({ default: m.Notifications })));
const Admin = lazy(() => import('@/pages/Admin'));

// New idea and brainstorm components
const IdeaDetail = lazy(() => import('@/pages/IdeaDetail').then(m => ({ default: m.IdeaDetail })));
const BrainstormNew = lazy(() => import('@/pages/BrainstormNew').then(m => ({ default: m.BrainstormNew })));
const BrainstormDetailPage = lazy(() => import('@/pages/BrainstormDetail').then(m => ({ default: m.BrainstormDetail })));

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

  // Shell routes for specific authenticated sections
  {
    path: '/app',
    element: <MainShell />,
    children: [
      // Public mode routes  
      {
        path: 'public',
        children: [
          {
            path: 'profile',
            element: (
              <LazyWrapper>
                <PublicProfile />
              </LazyWrapper>
            ),
          },
          {
            path: 'brainstorms',
            element: (
              <LazyWrapper>
                <BrainstormsList />
              </LazyWrapper>
            ),
          },
          {
            path: 'brainstorms/:id',
            element: (
              <LazyWrapper>
                <BrainstormDetail />
              </LazyWrapper>
            ),
          },
          {
            path: 'notifications',
            element: (
              <LazyWrapper>
                <Notifications />
              </LazyWrapper>
            ),
          },
        ],
      },
      
      // Business mode routes
      {
        path: 'business',
        children: [
          {
            path: 'dashboard',
            element: (
              <LazyWrapper>
                <BusinessDashboard />
              </LazyWrapper>
            ),
          },
          {
            path: 'reports',
            element: (
              <LazyWrapper>
                <BusinessReports />
              </LazyWrapper>
            ),
          },
          {
            path: 'notifications',
            element: (
              <LazyWrapper>
                <Notifications />
              </LazyWrapper>
            ),
          },
        ],
      },
      
    ],
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
  
  // Keep existing routes from nav-items for compatibility
  ...navItems.map(({ to, page }) => ({
    path: to,
    element: page,
  })),
]);
