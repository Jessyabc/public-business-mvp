import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowRight, Bookmark, MessageCircle } from 'lucide-react';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;  // Continue spark
  onSwipeRight?: () => void; // Save reference
  onLongPress?: () => void;  // Preview
  className?: string;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
  className
}: SwipeableCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 0, 150], [-5, 0, 5]);
  const leftOpacity = useTransform(x, [-150, -50, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 50, 150], [0, 0.5, 1]);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);

  const handleDragStart = () => {
    setIsDragging(true);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 100;
    
    if (info.offset.x < -threshold && onSwipeLeft) {
      onSwipeLeft();
    } else if (info.offset.x > threshold && onSwipeRight) {
      onSwipeRight();
    }
  };

  const handlePointerDown = () => {
    longPressTimer.current = setTimeout(() => {
      if (!isDragging && onLongPress) {
        onLongPress();
      }
    }, 500);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Left action indicator (Continue) */}
      <motion.div
        style={{ opacity: leftOpacity }}
        className="absolute inset-y-0 left-0 w-20 flex items-center justify-center pointer-events-none"
      >
        <div className="flex flex-col items-center gap-1 text-[var(--accent)]">
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs font-medium">Continue</span>
        </div>
      </motion.div>

      {/* Right action indicator (Save) */}
      <motion.div
        style={{ opacity: rightOpacity }}
        className="absolute inset-y-0 right-0 w-20 flex items-center justify-center pointer-events-none"
      >
        <div className="flex flex-col items-center gap-1 text-purple-400">
          <Bookmark className="w-6 h-6" />
          <span className="text-xs font-medium">Save</span>
        </div>
      </motion.div>

      {/* Swipeable card */}
      <motion.div
        style={{ x, rotate, scale }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative cursor-grab active:cursor-grabbing",
          isDragging && "z-10"
        )}
      >
        {children}
        
        {/* Drag hint */}
        {!isDragging && (
          <div className="absolute inset-x-0 bottom-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="flex items-center gap-2 text-xs text-white/30">
              <ArrowRight className="w-3 h-3 rotate-180" />
              <span>Swipe</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
