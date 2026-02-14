/**
 * Think Space: Open Circle - Break Control
 * 
 * Break-only control positioned between input area and feed.
 * - Pull in ANY direction: Break chain (start new)
 * - No tap action (tapping empty space continues chain)
 * 
 * Visual: Circle follows cursor omnidirectionally with radial trail.
 * Auto-snaps and triggers break composer when threshold is passed.
 */

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useChainGestures } from '../hooks/useChainGestures';
import { cn } from '@/lib/utils';

const PB_BLUE = '#489FE3';

interface OpenCircleProps {
  onBreak: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function OpenCircle({ onBreak, className, size = 'md' }: OpenCircleProps) {
  const isMobile = useIsMobile();
  const circleRef = useRef<HTMLDivElement>(null);
  
  const baseSize = size === 'lg' ? 72 : size === 'sm' ? 28 : (isMobile ? 44 : 36);
  
  const { gestureState, visualX, visualY, visualDist, handlers } = useChainGestures({
    onBreak,
    enabled: true,
  });
  
  const snapProgress = gestureState.resistance;
  const isPulling = gestureState.isActive && snapProgress > 0.05;
  const isNearSnap = snapProgress > 0.65;
  const hasSnapped = gestureState.didSnap;
  
  return (
    <div className={cn("open-circle-container relative flex items-center justify-center", className)}
      style={{ width: baseSize * 3, height: baseSize * 2 }}
    >
      {/* Radial trail ring */}
      {isPulling && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: visualDist * 2 + baseSize,
            height: visualDist * 2 + baseSize,
            border: `1.5px solid ${PB_BLUE}${Math.round(snapProgress * 40).toString(16).padStart(2, '0')}`,
            background: `radial-gradient(circle, transparent 60%, ${PB_BLUE}${Math.round(snapProgress * 12).toString(16).padStart(2, '0')} 100%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        />
      )}

      {/* Origin ghost (stays in place during pull) */}
      {isPulling && (
        <div
          className="absolute rounded-full"
          style={{
            width: baseSize * 0.5,
            height: baseSize * 0.5,
            background: `${PB_BLUE}15`,
            border: `1px dashed ${PB_BLUE}25`,
          }}
        />
      )}
      
      {/* The circle itself - follows cursor omnidirectionally */}
      <motion.div
        ref={circleRef}
        className={cn(
          "open-circle relative z-10",
          "rounded-full touch-none select-none",
          isPulling ? "cursor-grabbing" : "cursor-grab",
        )}
        style={{
          width: baseSize,
          height: baseSize,
          background: hasSnapped
            ? `radial-gradient(circle, ${PB_BLUE}60 0%, ${PB_BLUE}40 70%)`
            : isPulling
            ? `radial-gradient(circle, ${PB_BLUE}40 0%, ${PB_BLUE}20 70%)`
            : `radial-gradient(circle, ${PB_BLUE}25 0%, ${PB_BLUE}08 70%)`,
          border: `2px solid ${hasSnapped ? `${PB_BLUE}80` : isPulling ? `${PB_BLUE}50` : `${PB_BLUE}25`}`,
          boxShadow: hasSnapped
            ? `0 0 24px ${PB_BLUE}60, 0 0 48px ${PB_BLUE}30`
            : isNearSnap
            ? `0 0 20px ${PB_BLUE}40, 0 0 40px ${PB_BLUE}20`
            : isPulling
              ? `0 0 12px ${PB_BLUE}20`
              : 'none',
        }}
        animate={{
          x: visualX,
          y: visualY,
          scale: hasSnapped ? 1.3 : isNearSnap ? 1.15 : isPulling ? 1.08 : 1,
        }}
        transition={{
          x: gestureState.isActive
            ? { type: 'tween', duration: 0.03 } // Direct follow during drag
            : { type: 'spring', stiffness: 500, damping: 25 }, // Spring back
          y: gestureState.isActive
            ? { type: 'tween', duration: 0.03 }
            : { type: 'spring', stiffness: 500, damping: 25 },
          scale: { type: 'spring', stiffness: 300, damping: 20 },
        }}
        whileHover={{
          scale: gestureState.isActive ? undefined : 1.1,
          boxShadow: `0 0 16px ${PB_BLUE}30`,
        }}
        {...handlers}
      >
        {/* Inner pulse */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${PB_BLUE}15 0%, transparent 70%)` }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Plus icon (fades out during pull) */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={{ opacity: isPulling ? 0 : 0.5 }}
          transition={{ duration: 0.15 }}
        >
          <div className="w-[40%] h-[2px] rounded-full" style={{ background: PB_BLUE }} />
          <div className="absolute w-[2px] h-[40%] rounded-full" style={{ background: PB_BLUE }} />
        </motion.div>
        
        {/* Break indicator (appears during pull - horizontal line) */}
        {isPulling && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: snapProgress, rotate: (gestureState.angle * 180) / Math.PI }}
          >
            <div className="w-[50%] h-[2px] rounded-full" style={{ background: PB_BLUE }} />
          </motion.div>
        )}
      </motion.div>
      
      {/* Snap label */}
      {(isNearSnap || hasSnapped) && (
        <motion.span
          className="absolute text-[10px] whitespace-nowrap pointer-events-none font-medium"
          style={{ 
            color: PB_BLUE,
            top: -18,
          }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {hasSnapped ? '✦ New Chain' : 'Break'}
        </motion.span>
      )}
    </div>
  );
}
