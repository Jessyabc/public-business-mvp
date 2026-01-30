import { ReactNode } from 'react';

interface SwipeNavigationWrapperProps {
  children: ReactNode;
}

/**
 * SwipeNavigationWrapper - Disabled
 * 
 * Screen-level swipe navigation has been disabled to prevent conflicts
 * with bottom navigation panel swipes and improve UX.
 * Panel-level swipes (via BottomNavigation) remain active.
 */
export function SwipeNavigationWrapper({ children }: SwipeNavigationWrapperProps) {
  // Return children directly - no swipe wrapper
  return <>{children}</>;
}
