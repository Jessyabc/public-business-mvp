import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from './use-mobile';
import { useHaptic } from './useHaptic';

/**
 * Swipe Navigation Hook
 * 
 * Enables swipe gestures on mobile devices to navigate between main sections.
 * Used in MainLayout via SwipeNavigationWrapper component.
 * 
 * Current sections:
 * - '/' (index 0) - Main feed
 * - '/my-posts' (index 2) - User's posts
 * 
 * Usage: Wrapped around main content in MainLayout.tsx
 */

interface SwipeSection {
  path: string;
  index: number;
}

const MAIN_SECTIONS: SwipeSection[] = [
  { path: '/', index: 0 },
  { path: '/my-posts', index: 2 },
];

export function useSwipeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { triggerHaptic } = useHaptic();

  const getCurrentIndex = () => {
    const current = MAIN_SECTIONS.find(s => s.path === location.pathname);
    return current?.index ?? 0;
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!isMobile) return;

    const currentIndex = getCurrentIndex();
    let targetIndex: number;

    if (direction === 'left') {
      // Swipe left = go to next section (right)
      targetIndex = Math.min(currentIndex + 1, MAIN_SECTIONS.length - 1);
    } else {
      // Swipe right = go to previous section (left)
      targetIndex = Math.max(currentIndex - 1, 0);
    }

    if (targetIndex !== currentIndex) {
      triggerHaptic('light');
      navigate(MAIN_SECTIONS[targetIndex].path);
    }
  };

  return {
    handleSwipe,
    isMobile,
    currentIndex: getCurrentIndex(),
  };
}
