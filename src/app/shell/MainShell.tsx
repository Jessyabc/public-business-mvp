import { useEffect, Suspense } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useUIModeStore } from '@/stores/uiModeStore';
import { profileService } from '@/services/mock';
import { Page } from '@/ui/layouts/Page';
import { ModeSwitcher } from './ModeSwitcher';
import { AdaptiveBottomBar } from './AdaptiveBottomBar';
import { ErrorBoundary } from '@/ui/feedback/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function MainShell() {
  const { uiMode, lastVisitedTab, setLastVisitedTab } = useUIModeStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize user profile and handle first visit
  useEffect(() => {
    let profile = profileService.getProfile();
    
    // If no profile exists, create default and redirect to profile
    if (!profile) {
      profile = profileService.createDefaultProfile();
      navigate('/public/profile');
      return;
    }

    // If we're on root path, redirect to last visited tab for current mode
    if (location.pathname === '/' || location.pathname === '') {
      navigate(lastVisitedTab[uiMode]);
    }
  }, [navigate, location.pathname, uiMode, lastVisitedTab]);

  // Track visited tabs
  useEffect(() => {
    if (location.pathname.startsWith('/public/') || location.pathname.startsWith('/business/')) {
      setLastVisitedTab(uiMode, location.pathname);
    }
  }, [location.pathname, uiMode, setLastVisitedTab]);

  return (
    <Page className="pb-20"> {/* Add bottom padding for nav bar */}
      {/* Mode Switcher */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
        <ModeSwitcher />
      </div>

      {/* Main Content */}
      <div className="pt-16"> {/* Add top padding for mode switcher */}
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner />
            </div>
          }>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Adaptive Bottom Navigation */}
      <AdaptiveBottomBar />
    </Page>
  );
}