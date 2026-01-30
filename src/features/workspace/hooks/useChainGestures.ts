/**
 * Think Space: Pull-the-Thread System - Gesture Handling
 * 
 * Pull-to-break gesture for creating new chains.
 * Long-press for merge (V2).
 * 
 * Gesture must occur on the open circle only.
 * Drag within bottom 180° with resistance.
 */

import { useCallback, useRef, useState } from 'react';
import { useHaptic } from '@/hooks/useHaptic';
import type { PullGestureState } from '../types/chain';

const PULL_THRESHOLD = 120; // pixels to trigger snap
const SNAP_RESISTANCE = 0.8; // normalized threshold
const LONG_PRESS_DURATION = 500; // ms

interface UseChainGesturesOptions {
  onBreak: () => void;
  onMerge?: () => void;
  enabled?: boolean;
}

interface GestureHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

/**
 * Easing function for visual feedback
 */
function easeOutQuad(t: number): number {
  return t * (2 - t);
}

/**
 * Check if drag is within bottom 180° (downward)
 */
function isWithinBottomHemisphere(deltaY: number): boolean {
  return deltaY > 0;
}

export function useChainGestures({
  onBreak,
  onMerge,
  enabled = true,
}: UseChainGesturesOptions): {
  gestureState: PullGestureState;
  visualOffset: number;
  handlers: GestureHandlers;
} {
  const { triggerHaptic } = useHaptic();
  
  const [gestureState, setGestureState] = useState<PullGestureState>({
    isActive: false,
    startY: 0,
    currentY: 0,
    resistance: 0,
    didSnap: false,
    didHaptic: false,
  });
  
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  
  // Calculate visual offset based on resistance
  const visualOffset = gestureState.isActive
    ? easeOutQuad(Math.min(gestureState.resistance, 1)) * 80
    : 0;

  // Clear long-press timer
  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Reset gesture state
  const resetGesture = useCallback(() => {
    setGestureState({
      isActive: false,
      startY: 0,
      currentY: 0,
      resistance: 0,
      didSnap: false,
      didHaptic: false,
    });
    clearLongPress();
  }, [clearLongPress]);

  // Handle start (touch or mouse)
  const handleStart = useCallback((clientY: number, clientX: number) => {
    if (!enabled) return;
    
    startPosRef.current = { x: clientX, y: clientY };
    
    setGestureState({
      isActive: true,
      startY: clientY,
      currentY: clientY,
      resistance: 0,
      didSnap: false,
      didHaptic: false,
    });
    
    // Start long-press timer for merge (V2)
    if (onMerge) {
      longPressTimerRef.current = setTimeout(() => {
        triggerHaptic('light');
        onMerge();
        resetGesture();
      }, LONG_PRESS_DURATION);
    }
  }, [enabled, onMerge, triggerHaptic, resetGesture]);

  // Handle move (touch or mouse)
  const handleMove = useCallback((clientY: number, clientX: number) => {
    if (!gestureState.isActive || !enabled) return;
    
    const deltaY = clientY - gestureState.startY;
    const deltaX = Math.abs(clientX - startPosRef.current.x);
    
    // If moved more than 10px horizontally, abort long-press
    if (deltaX > 10 || Math.abs(deltaY) > 10) {
      clearLongPress();
    }
    
    // Only allow downward drag (break gesture)
    if (isWithinBottomHemisphere(deltaY)) {
      const resistance = Math.min(1, deltaY / PULL_THRESHOLD);
      
      setGestureState((prev) => {
        // Haptic feedback at threshold
        if (resistance > 0.7 && !prev.didHaptic) {
          triggerHaptic('medium');
          return {
            ...prev,
            currentY: clientY,
            resistance,
            didHaptic: true,
          };
        }
        
        return {
          ...prev,
          currentY: clientY,
          resistance,
        };
      });
    }
  }, [gestureState.isActive, gestureState.startY, enabled, clearLongPress, triggerHaptic]);

  // Handle end (touch or mouse)
  const handleEnd = useCallback(() => {
    if (!gestureState.isActive || !enabled) return;
    
    clearLongPress();
    
    if (gestureState.resistance >= SNAP_RESISTANCE) {
      // SNAP — create new chain
      triggerHaptic('heavy');
      onBreak();
      setGestureState((prev) => ({ ...prev, didSnap: true }));
    }
    
    // Reset after animation
    requestAnimationFrame(() => {
      resetGesture();
    });
  }, [gestureState.isActive, gestureState.resistance, enabled, clearLongPress, triggerHaptic, onBreak, resetGesture]);

  // Touch handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientY, touch.clientX);
  }, [handleStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientY, touch.clientX);
  }, [handleMove]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (gestureState.resistance > 0) {
      e.preventDefault();
    }
    handleEnd();
  }, [gestureState.resistance, handleEnd]);

  // Mouse handlers (for desktop)
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // Only left click
    if (e.button !== 0) return;
    handleStart(e.clientY, e.clientX);
  }, [handleStart]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientY, e.clientX);
  }, [handleMove]);

  const onMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Context menu (right-click) for merge on desktop
  const onContextMenu = useCallback((e: React.MouseEvent) => {
    if (!enabled || !onMerge) return;
    e.preventDefault();
    triggerHaptic('light');
    onMerge();
  }, [enabled, onMerge, triggerHaptic]);

  return {
    gestureState,
    visualOffset,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onContextMenu,
    },
  };
}
