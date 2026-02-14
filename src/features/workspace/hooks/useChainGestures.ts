/**
 * Think Space: Omnidirectional Pull-to-Break Gesture
 * 
 * Pull the + circle in ANY direction (left, right, down, diagonals).
 * When radial distance exceeds threshold, snap back + fire onBreak.
 * Spring physics for smooth return animation.
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { useHaptic } from '@/hooks/useHaptic';
import type { PullGestureState } from '../types/chain';

const PULL_THRESHOLD = 80; // px radius to trigger break
const HAPTIC_THRESHOLD = 0.65; // normalized distance for pre-snap haptic
const SNAP_THRESHOLD = 0.85; // normalized distance for auto-snap

interface UseChainGesturesOptions {
  onBreak: () => void;
  enabled?: boolean;
}

export function useChainGestures({ onBreak, enabled = true }: UseChainGesturesOptions) {
  const { triggerHaptic } = useHaptic();
  
  const [gestureState, setGestureState] = useState<PullGestureState>({
    isActive: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    resistance: 0,
    didSnap: false,
    didHaptic: false,
    angle: 0,
    direction: null,
  });
  
  const isActiveRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const didSnapRef = useRef(false);
  const gestureConsumedRef = useRef(false);

  const resetGesture = useCallback(() => {
    isActiveRef.current = false;
    didSnapRef.current = false;
    setGestureState({
      isActive: false, startX: 0, startY: 0, currentX: 0, currentY: 0,
      resistance: 0, didSnap: false, didHaptic: false, angle: 0, direction: null,
    });
    setTimeout(() => { gestureConsumedRef.current = false; }, 150);
  }, []);

  const wasGestureConsumed = useCallback(() => gestureConsumedRef.current, []);

  // Compute radial distance + angle
  const computeRadial = useCallback((cx: number, cy: number) => {
    const dx = cx - startRef.current.x;
    const dy = cy - startRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const resistance = Math.min(dist / PULL_THRESHOLD, 1);
    const direction: 'left' | 'right' | null = Math.abs(dx) > 5 ? (dx < 0 ? 'left' : 'right') : null;
    return { dist, angle, resistance, direction };
  }, []);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!enabled) return;
    startRef.current = { x: clientX, y: clientY };
    isActiveRef.current = true;
    didSnapRef.current = false;
    gestureConsumedRef.current = false;
    setGestureState({
      isActive: true, startX: clientX, startY: clientY,
      currentX: clientX, currentY: clientY,
      resistance: 0, didSnap: false, didHaptic: false,
      angle: 0, direction: null,
    });
  }, [enabled]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isActiveRef.current || !enabled || didSnapRef.current) return;
    
    const { resistance, angle, direction } = computeRadial(clientX, clientY);

    // Auto-snap
    if (resistance >= SNAP_THRESHOLD) {
      didSnapRef.current = true;
      gestureConsumedRef.current = true;
      triggerHaptic('heavy');
      
      setGestureState(prev => ({
        ...prev, currentX: clientX, currentY: clientY,
        resistance: 1, didSnap: true, angle, direction,
      }));
      
      // Fire break after brief snap animation
      setTimeout(() => {
        onBreak();
        resetGesture();
      }, 200);
      return;
    }

    // Pre-snap haptic
    setGestureState(prev => {
      const shouldHaptic = resistance > HAPTIC_THRESHOLD && !prev.didHaptic;
      if (shouldHaptic) triggerHaptic('medium');
      return {
        ...prev, currentX: clientX, currentY: clientY,
        resistance, angle, direction,
        didHaptic: prev.didHaptic || shouldHaptic,
      };
    });
  }, [enabled, computeRadial, triggerHaptic, onBreak, resetGesture]);

  const handleEnd = useCallback(() => {
    if (!isActiveRef.current) return;
    // If didn't snap, spring back
    resetGesture();
  }, [resetGesture]);

  // Mouse global handlers
  useEffect(() => {
    if (!isActiveRef.current) return;
    
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [handleMove, handleEnd]);

  const handlers = {
    onTouchStart: useCallback((e: React.TouchEvent) => {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }, [handleStart]),
    onTouchMove: useCallback((e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }, [handleMove]),
    onTouchEnd: useCallback(() => handleEnd(), [handleEnd]),
    onMouseDown: useCallback((e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    }, [handleStart]),
  };

  // Compute visual offset (clamped to threshold)
  const dx = gestureState.currentX - gestureState.startX;
  const dy = gestureState.currentY - gestureState.startY;
  const visualDist = Math.min(Math.sqrt(dx * dx + dy * dy), PULL_THRESHOLD);
  const visualX = gestureState.isActive ? Math.cos(gestureState.angle) * visualDist : 0;
  const visualY = gestureState.isActive ? Math.sin(gestureState.angle) * visualDist : 0;

  return {
    gestureState,
    visualX,
    visualY,
    visualDist,
    wasGestureConsumed,
    handlers,
  };
}
