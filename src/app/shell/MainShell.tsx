import { useEffect, Suspense } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useUIModeStore } from '@/stores/uiModeStore';
import { useAuth } from '@/contexts/AuthContext';
import { Page } from '@/ui/layouts/Page';
import { ModeSwitcher } from './ModeSwitcher';
import { AdaptiveBottomBar } from './AdaptiveBottomBar';
import { ErrorBoundary } from '@/ui/feedback/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function MainShell() {
  const { uiMode, lastVisitedTab, setLastVisitedTab } = useUIModeStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle first visit and navigation
  useEffect(() => {
    // If we're on root path, redirect to last visited tab for current mode
    if (location.pathname === '/' || location.pathname === '') {
      if (user) {
        navigate(lastVisitedTab[uiMode] || `/${uiMode}`);
      } else {
        navigate('/landing');
      }
    }
  }, [navigate, location.pathname, uiMode, lastVisitedTab, user]);

  // Track visited tabs
  useEffect(() => {
    if (location.pathname.startsWith('/public/') || location.pathname.startsWith('/business/')) {
      setLastVisitedTab(uiMode, location.pathname);
    }
  }, [location.pathname, uiMode, setLastVisitedTab]);

  return (
    <div className="stage">
      {/* SVG Filter Definition for Glass Displacement Effect */}
      <svg className="glass-filter-sprite" aria-hidden="true">
        <defs>
          <filter id="glass-displace">
            <feTurbulence
              baseFrequency="0.04"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="8"
            />
          </filter>
        </defs>
      </svg>

      {/* Mode Switcher */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
        <ModeSwitcher />
      </div>

      {/* Main Content */}
      <main className="content-wrap">
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner />
            </div>
          }>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Adaptive Bottom Navigation with proper dock styling */}
      <AdaptiveBottomBar />
    </div>
  );
}