import { motion, PanInfo } from 'framer-motion';
import { ReactNode } from 'react';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

interface SwipeNavigationWrapperProps {
  children: ReactNode;
}

export function SwipeNavigationWrapper({ children }: SwipeNavigationWrapperProps) {
  const { handleSwipe, isMobile } = useSwipeNavigation();

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 50;
    const swipeVelocityThreshold = 500;

    if (
      Math.abs(info.offset.x) > swipeThreshold ||
      Math.abs(info.velocity.x) > swipeVelocityThreshold
    ) {
      if (info.offset.x > 0) {
        handleSwipe('right');
      } else {
        handleSwipe('left');
      }
    }
  };

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      className="touch-pan-y"
    >
      {children}
    </motion.div>
  );
}
