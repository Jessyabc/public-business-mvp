import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainShell } from './shell/MainShell';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load components for code splitting
const PublicProfile = lazy(() => import('./public/Profile').then(m => ({ default: m.PublicProfile })));
const BrainstormsList = lazy(() => import('./public/BrainstormsList').then(m => ({ default: m.BrainstormsList })));
const BrainstormDetail = lazy(() => import('./public/BrainstormDetail').then(m => ({ default: m.BrainstormDetail })));
const BusinessDashboard = lazy(() => import('./business/Dashboard').then(m => ({ default: m.BusinessDashboard })));
const BusinessReports = lazy(() => import('./business/Reports').then(m => ({ default: m.BusinessReports })));
const Notifications = lazy(() => import('./shared/Notifications').then(m => ({ default: m.Notifications })));

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
  // Main app shell routes (authenticated experience)
  {
    path: '/',
    element: <MainShell />,
    children: [
      // Default redirect
      {
        index: true,
        element: <Navigate to="/public/profile" replace />,
      },
      
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
  
  // Landing page (unauthenticated)
  {
    path: '/landing',
    element: <Landing />,
  },
  
  // Keep all existing routes from nav-items for compatibility
  ...navItems
    .filter(item => !['/', '/public/*', '/business/*'].includes(item.to))
    .map(({ to, page }) => ({
      path: to,
      element: page,
    })),
]);
