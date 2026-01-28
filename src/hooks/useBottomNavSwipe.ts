import { useState, useRef, useCallback } from 'react';

export type SwipePanel = 'none' | 'profile' | 'business';
type SwipeDirection = 'left' | 'right' | null;

interface UseBottomNavSwipeOptions {
  isBusinessMember: boolean;
  onNavigateBack?: () => void;
}

interface UseBottomNavSwipeReturn {
  activePanel: SwipePanel;
  setActivePanel: (panel: SwipePanel) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  swipeOffset: number;
  isSwipeInProgress: boolean;
}

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 0.3;

export function useBottomNavSwipe({ 
  isBusinessMember, 
  onNavigateBack 
}: UseBottomNavSwipeOptions): UseBottomNavSwipeReturn {
  const [activePanel, setActivePanel] = useState<SwipePanel>('none');
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeInProgress, setIsSwipeInProgress] = useState(false);
  
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const lastSwipeDirection = useRef<SwipeDirection>(null);
  const isVerticalScroll = useRef<boolean>(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
    isVerticalScroll.current = false;
    setIsSwipeInProgress(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwipeInProgress) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;
    
    // Detect if this is a vertical scroll (ignore if so)
    if (!isVerticalScroll.current && Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
      isVerticalScroll.current = true;
      setSwipeOffset(0);
      return;
    }
    
    if (isVerticalScroll.current) return;
    
    // Prevent same-direction consecutive swipes
    const currentDirection: SwipeDirection = deltaX > 0 ? 'right' : 'left';
    
    // Calculate max offset based on current panel state
    let maxOffset = window.innerWidth * 0.4; // 40% of screen width for visual feedback
    
    // Apply resistance when swiping in wrong direction
    if (activePanel === 'none') {
      // From main view, only allow right swipe (to profile)
      if (deltaX < 0) {
        setSwipeOffset(0);
        return;
      }
    } else if (activePanel === 'profile') {
      // From profile, allow left (back) or right (to business if member)
      if (deltaX > 0 && !isBusinessMember) {
        setSwipeOffset(0);
        return;
      }
    } else if (activePanel === 'business') {
      // From business, only allow left (back to profile)
      if (deltaX > 0) {
        setSwipeOffset(0);
        return;
      }
    }
    
    // Prevent same-direction consecutive swipes
    if (lastSwipeDirection.current === currentDirection) {
      // Already swiped this direction, need to swipe opposite first
      const needsOpposite = (
        (activePanel === 'profile' && currentDirection === 'right' && !isBusinessMember) ||
        (activePanel === 'business' && currentDirection === 'right')
      );
      
      if (needsOpposite) {
        setSwipeOffset(0);
        return;
      }
    }
    
    setSwipeOffset(Math.min(Math.abs(deltaX), maxOffset) * (deltaX > 0 ? 1 : -1));
  }, [isSwipeInProgress, activePanel, isBusinessMember]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwipeInProgress || isVerticalScroll.current) {
      setIsSwipeInProgress(false);
      setSwipeOffset(0);
      return;
    }
    
    const deltaTime = Date.now() - touchStartTime.current;
    const velocity = Math.abs(swipeOffset) / deltaTime;
    const passedThreshold = Math.abs(swipeOffset) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD;
    
    if (passedThreshold) {
      const direction: SwipeDirection = swipeOffset > 0 ? 'right' : 'left';
      
      // Update panel based on swipe direction and current state
      if (activePanel === 'none' && direction === 'right') {
        setActivePanel('profile');
        lastSwipeDirection.current = 'right';
      } else if (activePanel === 'profile') {
        if (direction === 'left') {
          setActivePanel('none');
          lastSwipeDirection.current = 'left';
          onNavigateBack?.();
        } else if (direction === 'right' && isBusinessMember) {
          setActivePanel('business');
          lastSwipeDirection.current = 'right';
        }
      } else if (activePanel === 'business' && direction === 'left') {
        setActivePanel('profile');
        lastSwipeDirection.current = 'left';
      }
    }
    
    setIsSwipeInProgress(false);
    setSwipeOffset(0);
  }, [isSwipeInProgress, swipeOffset, activePanel, isBusinessMember, onNavigateBack]);

  return {
    activePanel,
    setActivePanel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    swipeOffset,
    isSwipeInProgress,
  };
}
