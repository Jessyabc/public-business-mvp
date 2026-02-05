/**
 * Think Space: Open Circle - Break/Continue Control
 * 
 * Positioned between input area and feed.
 * - Tap: Continue chain (append thought)
 * - Pull LEFT or RIGHT: Break chain (start new)
 * - Long-press / Right-click: Merge (V2)
 * 
 * Visual: Horizontal stretch on drag, PB Blue glow on interaction
 */

import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useChainGestures } from '../hooks/useChainGestures';
import { cn } from '@/lib/utils';

// PB Blue - active cognition color
const PB_BLUE = '#489FE3';

interface OpenCircleProps {
  onContinue: () => void;
  onBreak: () => void;
  onMerge?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function OpenCircle({
  onContinue,
  onBreak,
  onMerge,
  className,
  size = 'md',
}: OpenCircleProps) {
  const isMobile = useIsMobile();
  const circleRef = useRef<HTMLDivElement>(null);
  
  // Size based on device
  const baseSize = size === 'lg' ? 56 : size === 'sm' ? 22 : (isMobile ? 36 : 26);
  
  // Gesture handling
  const { gestureState, visualOffset, direction, wasGestureConsumed, handlers } = useChainGestures({
    onBreak,
    onMerge,
    enabled: true,
  });
  
  // Calculate horizontal offset based on direction
  const xOffset = direction === 'left' ? -visualOffset : direction === 'right' ? visualOffset : 0;
  
  // Handle tap/click to continue - only if no drag occurred
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Prevent if gesture was consumed (drag, snap, or long-press)
    if (wasGestureConsumed()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    onContinue();
  }, [wasGestureConsumed, onContinue]);
  
  // Determine interaction state
  const isPulling = gestureState.isActive && gestureState.resistance > 0.1;
  const isNearSnap = gestureState.resistance > 0.7;
  const isLeftPull = direction === 'left';
  const isRightPull = direction === 'right';
  
  return (
    <div 
      className={cn(
        "open-circle-container relative flex items-center justify-center",
        className
      )}
    >
      {/* Left stretch indicator */}
      {isPulling && isLeftPull && (
        <motion.div
          className="absolute h-[2px] origin-right"
          style={{
            right: '50%',
            width: visualOffset,
            background: `linear-gradient(to left, ${PB_BLUE}40, ${PB_BLUE}10)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      
      {/* Right stretch indicator */}
      {isPulling && isRightPull && (
        <motion.div
          className="absolute h-[2px] origin-left"
          style={{
            left: '50%',
            width: visualOffset,
            background: `linear-gradient(to right, ${PB_BLUE}40, ${PB_BLUE}10)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      
      {/* The circle itself */}
      <motion.div
        ref={circleRef}
        className={cn(
          "open-circle relative cursor-grab active:cursor-grabbing z-10",
          "rounded-full touch-none select-none",
          "transition-colors duration-200"
        )}
        style={{
          width: baseSize,
          height: baseSize,
          background: isPulling
            ? `radial-gradient(circle, ${PB_BLUE}40 0%, ${PB_BLUE}20 70%)`
            : `radial-gradient(circle, ${PB_BLUE}30 0%, ${PB_BLUE}10 70%)`,
          border: `2px solid ${isPulling ? `${PB_BLUE}60` : `${PB_BLUE}30`}`,
          boxShadow: isNearSnap
            ? `0 0 20px ${PB_BLUE}50, 0 0 40px ${PB_BLUE}30`
            : isPulling
              ? `0 0 12px ${PB_BLUE}30`
              : 'none',
        }}
        animate={{
          x: xOffset,
          scale: isNearSnap ? 1.15 : isPulling ? 1.05 : 1,
        }}
        transition={{
          x: { type: 'spring', stiffness: 400, damping: 30 },
          scale: { duration: 0.15 },
        }}
        whileHover={{
          scale: gestureState.isActive ? undefined : 1.1,
          boxShadow: `0 0 16px ${PB_BLUE}40`,
        }}
        whileTap={{
          scale: gestureState.isActive ? undefined : 0.95,
        }}
        onClick={handleClick}
        {...handlers}
      >
        {/* Inner glow / pulse animation */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${PB_BLUE}20 0%, transparent 70%)`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Plus indicator (subtle) */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-150"
          style={{
            opacity: isPulling ? 0 : 0.5,
          }}
        >
          <div 
            className="w-[35%] h-[1.5px] rounded-full"
            style={{ background: PB_BLUE }}
          />
          <div 
            className="absolute w-[1.5px] h-[35%] rounded-full"
            style={{ background: PB_BLUE }}
          />
        </div>
        
        {/* Break indicator (horizontal line during pull) */}
        {isPulling && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: gestureState.resistance }}
          >
            <div 
              className="w-[35%] h-[1.5px] rounded-full"
              style={{ background: PB_BLUE }}
            />
          </motion.div>
        )}
      </motion.div>
      
      {/* Snap hint (appears near threshold) */}
      {isNearSnap && (
        <motion.span
          className="absolute text-[9px] whitespace-nowrap pointer-events-none font-medium"
          style={{ 
            color: PB_BLUE,
            left: isLeftPull ? `calc(50% - ${visualOffset + 30}px)` : undefined,
            right: isRightPull ? `calc(50% - ${visualOffset + 30}px)` : undefined,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
        >
          Break
        </motion.span>
      )}
    </div>
  );
}
