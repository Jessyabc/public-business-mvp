import { useState, useCallback } from 'react';
import { useIsMobile } from './use-mobile';
import { useHaptic } from './useHaptic';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  enabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  enabled = true,
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const isMobile = useIsMobile();
  const { triggerHaptic } = useHaptic();

  const handleDragStart = useCallback(() => {
    if (!enabled || !isMobile || isRefreshing) return false;
    // Only allow pull to refresh if we're at the top of the page
    return window.scrollY === 0;
  }, [enabled, isMobile, isRefreshing]);

  const handleDrag = useCallback(
    (offsetY: number) => {
      if (!enabled || !isMobile || isRefreshing) return;
      
      // Apply resistance curve
      const resistance = Math.min(1, offsetY / (threshold * 2));
      const adjustedDistance = offsetY * resistance;
      setPullDistance(Math.max(0, adjustedDistance));

      // Trigger haptic feedback at threshold
      if (adjustedDistance >= threshold && pullDistance < threshold) {
        triggerHaptic('medium');
      }
    },
    [enabled, isMobile, isRefreshing, threshold, pullDistance, triggerHaptic]
  );

  const handleDragEnd = useCallback(
    async (offsetY: number) => {
      if (!enabled || !isMobile || isRefreshing) {
        setPullDistance(0);
        return;
      }

      const resistance = Math.min(1, offsetY / (threshold * 2));
      const adjustedDistance = offsetY * resistance;

      if (adjustedDistance >= threshold) {
        setIsRefreshing(true);
        triggerHaptic('success');
        
        try {
          await onRefresh();
        } finally {
          setTimeout(() => {
            setIsRefreshing(false);
            setPullDistance(0);
          }, 500);
        }
      } else {
        setPullDistance(0);
      }
    },
    [enabled, isMobile, isRefreshing, threshold, onRefresh, triggerHaptic]
  );

  return {
    isRefreshing,
    pullDistance,
    isPulling: pullDistance > 0,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    isMobile,
  };
}
