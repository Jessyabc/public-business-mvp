import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  enabled?: boolean;
}

export function PullToRefresh({ children, onRefresh, enabled = true }: PullToRefreshProps) {
  const {
    isRefreshing,
    pullDistance,
    isPulling,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    isMobile,
  } = usePullToRefresh({ onRefresh, enabled });

  if (!isMobile) {
    return <>{children}</>;
  }

  const progress = Math.min(pullDistance / 80, 1);
  const rotation = progress * 360;

  return (
    <div className="relative">
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        animate={{
          y: isRefreshing ? 40 : Math.min(pullDistance - 20, 40),
          opacity: isPulling || isRefreshing ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          "backdrop-blur-xl border shadow-lg",
          "bg-background/90 border-border/20"
        )}>
          <Loader2 
            className={cn(
              "w-5 h-5 text-primary transition-transform",
              isRefreshing && "animate-spin"
            )}
            style={{
              transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
            }}
          />
        </div>
      </motion.div>

      {/* Draggable content wrapper */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0}
        onDragStart={(_, info) => {
          if (!handleDragStart()) {
            return false;
          }
        }}
        onDrag={(_, info) => {
          if (info.offset.y > 0) {
            handleDrag(info.offset.y);
          }
        }}
        onDragEnd={(_, info) => {
          handleDragEnd(info.offset.y);
        }}
        animate={{
          y: isRefreshing ? 20 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
