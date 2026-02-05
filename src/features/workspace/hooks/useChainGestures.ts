/**
 * Think Space: Horizontal Pull-to-Break Gesture
 * 
 * Horizontal (left/right) pull-to-break gesture for creating new chains.
 * Long-press for merge (V2).
 * 
 * Pull LEFT or RIGHT with 60px threshold to break chain.
 * Circle follows cursor horizontally during drag.
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { useHaptic } from '@/hooks/useHaptic';
import type { PullGestureState } from '../types/chain';

const PULL_THRESHOLD = 60; // pixels to trigger horizontal snap
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
  onContextMenu: (e: React.MouseEvent) => void;
}

/** Easing function for visual feedback - creates resistance feel */
function easeOutQuad(t: number): number { return t * (2 - t); }

export function useChainGestures({
  onBreak,
  onMerge,
  enabled = true,
}: UseChainGesturesOptions): {
  gestureState: PullGestureState;
  visualOffset: number;
  direction: 'left' | 'right' | null;
  wasGestureConsumed: () => boolean;
  handlers: GestureHandlers;
} {
  const { triggerHaptic } = useHaptic();
  
  const [gestureState, setGestureState] = useState<PullGestureState>({
    isActive: false,
    startX: 0,
    currentX: 0,
    resistance: 0,
    didSnap: false,
    didHaptic: false,
    direction: null,
  });
  
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);
  const hasDraggedRef = useRef(false); // Track if actual drag occurred
  const gestureConsumedRef = useRef(false); // Prevent click after gesture
  const currentResistanceRef = useRef(0); // Track current resistance for reliable gesture detection
  const currentDirectionRef = useRef<'left' | 'right' | null>(null);
  
  // Calculate visual offset - circle follows cursor horizontally with resistance
  const visualOffset = gestureState.isActive
    ? easeOutQuad(Math.min(gestureState.resistance, 1)) * PULL_THRESHOLD
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
      startX: 0,
      currentX: 0,
      resistance: 0,
      didSnap: false,
      didHaptic: false,
      direction: null,
    });
    currentResistanceRef.current = 0; // Reset ref
    currentDirectionRef.current = null;
    clearLongPress();
    isMouseDownRef.current = false;
    // Keep gestureConsumedRef true briefly to block click
    setTimeout(() => {
      gestureConsumedRef.current = false;
    }, 100);
  }, [clearLongPress]);
  
  // Check if gesture was consumed (for blocking click)
  const wasGestureConsumed = useCallback(() => {
    return gestureConsumedRef.current || hasDraggedRef.current;
  }, []);

  // Handle start (touch or mouse) - now tracks X position for horizontal
  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!enabled) return;
    
    startPosRef.current = { x: clientX, y: clientY };
    hasDraggedRef.current = false; // Reset drag flag
    gestureConsumedRef.current = false;
    
    setGestureState({
      isActive: true,
      startX: clientX,
      currentX: clientX,
      resistance: 0,
      didSnap: false,
      didHaptic: false,
      direction: null,
    });
    
    // Start long-press timer for merge (V2)
    if (onMerge) {
      longPressTimerRef.current = setTimeout(() => {
        gestureConsumedRef.current = true;
        triggerHaptic('light');
        onMerge();
        resetGesture();
      }, LONG_PRESS_DURATION);
    }
  }, [enabled, onMerge, triggerHaptic, resetGesture]);

  // Handle move (touch or mouse) - now uses horizontal delta
  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!gestureState.isActive || !enabled) return;
    
    const deltaX = clientX - gestureState.startX;
    const deltaY = Math.abs(clientY - startPosRef.current.y);
    
    // If moved more than 5px in any direction, mark as drag
    if (Math.abs(deltaX) > 5 || deltaY > 5) {
      hasDraggedRef.current = true;
      clearLongPress();
    }
    
    // Horizontal pull - either direction works
    if (Math.abs(deltaX) > 5) {
      const absDelta = Math.abs(deltaX);
      const resistance = Math.min(1, absDelta / PULL_THRESHOLD);
      const newDirection: 'left' | 'right' = deltaX < 0 ? 'left' : 'right';
      
      setGestureState((prev) => {
        // Haptic feedback at 70% threshold
        if (resistance > 0.7 && !prev.didHaptic) {
          triggerHaptic('medium');
          return {
            ...prev,
            currentX: clientX,
            resistance,
            didHaptic: true,
            direction: newDirection,
          };
        }
        
        const newState = {
          ...prev,
          currentX: clientX,
          resistance,
          direction: newDirection,
        };
        currentResistanceRef.current = resistance;
        currentDirectionRef.current = newDirection;
        return newState;
      });
    }
  }, [gestureState.isActive, gestureState.startX, enabled, clearLongPress, triggerHaptic]);

  // Handle end (touch or mouse)
  const handleEnd = useCallback(() => {
    if (!gestureState.isActive || !enabled) return;
    
    clearLongPress();
    
    // Use ref value to ensure we have the most current resistance (avoids stale closure)
    const currentResistance = currentResistanceRef.current;
    
    if (currentResistance >= SNAP_RESISTANCE) {
      // SNAP — create new chain with heavy haptic
      gestureConsumedRef.current = true;
      hasDraggedRef.current = true;
      triggerHaptic('heavy');
      // Call onBreak immediately to ensure chain break happens
      onBreak();
      setGestureState((prev) => ({ ...prev, didSnap: true }));
    }
    
    // Reset after animation frame
    requestAnimationFrame(() => {
      currentResistanceRef.current = 0; // Reset ref
      resetGesture();
    });
  }, [gestureState.isActive, enabled, clearLongPress, triggerHaptic, onBreak, resetGesture]);

  // Global mouse move and up handlers for desktop
  useEffect(() => {
    if (!isMouseDownRef.current) return;
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMove(e.clientY, e.clientX);
    };
    
    const handleGlobalMouseUp = () => {
      handleEnd();
      isMouseDownRef.current = false;
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleMove, handleEnd]);

  // Touch handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  }, [handleStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
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
    e.preventDefault(); // Prevent text selection during drag
    isMouseDownRef.current = true;
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);

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
    direction: gestureState.direction,
    wasGestureConsumed,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onMouseDown,
      onContextMenu,
    },
  };
}