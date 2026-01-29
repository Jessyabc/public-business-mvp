/**
 * Think Space: Open Circle - Continuation Point
 * 
 * The gesture-aware continuation indicator at the end of a chain.
 * - Tap: Continue chain (append thought)
 * - Pull down: Break chain (start new)
 * - Long-press / Right-click: Merge (V2)
 * 
 * Visual: Subtle pulse, PB Blue glow on interaction
 */

import { useCallback, useRef, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
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
  const baseSize = size === 'lg' ? 56 : size === 'sm' ? 24 : (isMobile ? 48 : 32);
  
  // Gesture handling
  const { gestureState, visualOffset, handlers } = useChainGestures({
    onBreak,
    onMerge,
    enabled: true,
  });
  
  // Animated spring for smooth visual feedback
  const springOffset = useSpring(0, { stiffness: 300, damping: 30 });
  
  useEffect(() => {
    springOffset.set(visualOffset);
  }, [visualOffset, springOffset]);
  
  // Transform for thread stretch effect
  const threadStretch = useTransform(springOffset, [0, 80], [0, 40]);
  
  // Handle tap/click to continue
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Prevent if gesture is active or just completed
    if (gestureState.isActive || gestureState.didSnap) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    onContinue();
  }, [gestureState.isActive, gestureState.didSnap, onContinue]);
  
  // Determine interaction state
  const isPulling = gestureState.isActive && gestureState.resistance > 0.1;
  const isNearSnap = gestureState.resistance > 0.7;
  
  return (
    <div 
      className={cn(
        "open-circle-container relative flex flex-col items-center",
        className
      )}
    >
      {/* Thread line that stretches during pull */}
      <motion.div
        className="thread-stretch w-[2px] origin-top"
        style={{
          height: threadStretch,
          background: `linear-gradient(to bottom, rgba(72, 159, 227, 0.15), rgba(72, 159, 227, 0.3))`,
        }}
      />
      
      {/* The circle itself */}
      <motion.div
        ref={circleRef}
        className={cn(
          "open-circle relative cursor-pointer",
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
          y: visualOffset,
        }}
        animate={{
          scale: isNearSnap ? 1.15 : isPulling ? 1.05 : 1,
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
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            opacity: isPulling ? 0 : 0.4,
          }}
        >
          <div 
            className="w-[40%] h-[2px] rounded-full"
            style={{ background: PB_BLUE }}
          />
          <div 
            className="absolute w-[2px] h-[40%] rounded-full"
            style={{ background: PB_BLUE }}
          />
        </div>
        
        {/* Break indicator (appears during pull) */}
        {isPulling && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ 
              opacity: gestureState.resistance, 
              rotate: gestureState.resistance * 45,
            }}
          >
            <div 
              className="w-[50%] h-[2px] rounded-full"
              style={{ background: PB_BLUE }}
            />
          </motion.div>
        )}
      </motion.div>
      
      {/* Visual hint on hover */}
      {!gestureState.isActive && (
        <motion.span
          className="absolute -bottom-6 text-[10px] whitespace-nowrap pointer-events-none"
          style={{ color: `${PB_BLUE}80` }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.6 }}
        >
          Pull ↓ to break
        </motion.span>
      )}
    </div>
  );
}
