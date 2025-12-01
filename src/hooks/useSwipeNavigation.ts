import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from './use-mobile';

interface SwipeSection {
  path: string;
  index: number;
}

const MAIN_SECTIONS: SwipeSection[] = [
  { path: '/', index: 0 },
  { path: '/open-ideas', index: 1 },
  { path: '/my-posts', index: 2 },
];

export function useSwipeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

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
      navigate(MAIN_SECTIONS[targetIndex].path);
    }
  };

  return {
    handleSwipe,
    isMobile,
    currentIndex: getCurrentIndex(),
  };
}
