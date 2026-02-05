/**
 * Think Space: Horizontal Pull-to-Break Gesture
 * 
 * Horizontal (left/right) pull-to-break gesture for creating new chains.
 * Long-press for merge (V2).
 * 
 * Circle follows cursor within 60px horizontal limit.
 * Auto-snaps when cursor passes threshold (no need to release).
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { useHaptic } from '@/hooks/useHaptic';
import type { PullGestureState } from '../types/chain';

const PULL_THRESHOLD = 60; // max horizontal distance circle can travel
const SNAP_RESISTANCE = 0.8; // normalized threshold (48px)
const LONG_PRESS_DURATION = 500; // ms
const MAX_VERTICAL_DRIFT = 40; // cancel gesture if vertical movement exceeds this

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
  const hasDraggedRef = useRef(false);
  const gestureConsumedRef = useRef(false);
  const didSnapRef = useRef(false); // Prevent double-snap
  
  // Calculate visual offset - circle follows cursor up to threshold
  const visualOffset = gestureState.isActive
    ? Math.min(Math.abs(gestureState.currentX - gestureState.startX), PULL_THRESHOLD)
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
    didSnapRef.current = false;
    clearLongPress();
    isMouseDownRef.current = false;
    // Keep gestureConsumedRef true briefly to block click
    setTimeout(() => {
      gestureConsumedRef.current = false;
      hasDraggedRef.current = false;
    }, 100);
  }, [clearLongPress]);
  
  // Check if gesture was consumed (for blocking click)
  const wasGestureConsumed = useCallback(() => {
    return gestureConsumedRef.current || hasDraggedRef.current;
  }, []);

  // Handle start (touch or mouse)
  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!enabled) return;
    
    startPosRef.current = { x: clientX, y: clientY };
    hasDraggedRef.current = false;
    gestureConsumedRef.current = false;
    didSnapRef.current = false;
    
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

  // Handle move - circle follows cursor, auto-snaps when threshold passed
  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!gestureState.isActive || !enabled || didSnapRef.current) return;
    
    const deltaX = clientX - gestureState.startX;
    const deltaY = Math.abs(clientY - startPosRef.current.y);
    
    // If moved more than 5px, mark as drag
    if (Math.abs(deltaX) > 5 || deltaY > 5) {
      hasDraggedRef.current = true;
      clearLongPress();
    }
    
    // Cancel gesture if vertical drift too high
    if (deltaY > MAX_VERTICAL_DRIFT) {
      resetGesture();
      return;
    }
    
    // Horizontal pull - either direction works
    if (Math.abs(deltaX) > 5) {
      const absDelta = Math.abs(deltaX);
      const resistance = Math.min(1, absDelta / PULL_THRESHOLD);
      const newDirection: 'left' | 'right' = deltaX < 0 ? 'left' : 'right';
      
      // AUTO-SNAP: When resistance reaches threshold, immediately trigger break
      if (resistance >= SNAP_RESISTANCE && !didSnapRef.current) {
        didSnapRef.current = true;
        gestureConsumedRef.current = true;
        hasDraggedRef.current = true;
        triggerHaptic('heavy');
        
        // Trigger break immediately on snap
        onBreak();
        
        // Update state to show snapped
        setGestureState((prev) => ({
          ...prev,
          currentX: clientX,
          resistance: 1,
          didSnap: true,
          direction: newDirection,
        }));
        
        // Reset after brief animation
        setTimeout(() => {
          resetGesture();
        }, 150);
        return;
      }
      
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
        
        return {
          ...prev,
          currentX: clientX,
          resistance,
          direction: newDirection,
        };
      });
    }
  }, [gestureState.isActive, gestureState.startX, enabled, clearLongPress, triggerHaptic, onBreak, resetGesture]);

  // Handle end - snap already handled in handleMove
  const handleEnd = useCallback(() => {
    if (!gestureState.isActive || !enabled) return;
    
    clearLongPress();
    
    // Reset after animation frame (snap already handled in move)
    requestAnimationFrame(() => {
      resetGesture();
    });
  }, [gestureState.isActive, enabled, clearLongPress, resetGesture]);

  // Global mouse move and up handlers for desktop
  useEffect(() => {
    if (!isMouseDownRef.current) return;
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      // FIXED: Was passing (clientY, clientX) - now correct order
      handleMove(e.clientX, e.clientY);
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
    if (e.button !== 0) return;
    e.preventDefault();
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