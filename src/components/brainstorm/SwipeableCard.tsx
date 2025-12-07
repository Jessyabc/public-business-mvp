import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowRight, Bookmark, MessageCircle, Check } from 'lucide-react';
import { useComposerStore } from '@/hooks/useComposerStore';
import { usePendingReferencesStore } from '@/stores/pendingReferencesStore';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

interface SwipeableCardProps {
  children: React.ReactNode;
  postId: string;
  postTitle?: string;
  onSwipeLeft?: () => void;  // Continue spark (optional override)
  onSwipeRight?: () => void; // Save reference (optional override)
  onLongPress?: () => void;  // Preview (optional override)
  className?: string;
}

export function SwipeableCard({
  children,
  postId,
  postTitle,
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
  className
}: SwipeableCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  const isMobile = useIsMobile();
  const { openComposer } = useComposerStore();
  const { addRef, hasRef, pendingRefs, removeRef } = usePendingReferencesStore();
  
  const isReferenced = hasRef(postId);
  
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
    
    if (info.offset.x < -threshold) {
      // Swipe Left → Continue Spark
      if (onSwipeLeft) {
        onSwipeLeft();
      } else {
        // Remove from references if present - continuation supersedes cross-link
        if (isReferenced) {
          removeRef(postId);
        }
        openComposer({ 
          parentPostId: postId, 
          relationType: 'continuation' 
        });
        toast.success(`Continuing: ${postTitle || 'this Spark'}`);
      }
    } else if (info.offset.x > threshold) {
      // Swipe Right → Add/Remove Reference (only if not currently continuing this post)
      if (onSwipeRight) {
        onSwipeRight();
      } else {
        if (isReferenced) {
          removeRef(postId);
          toast.info('Removed from references');
        } else {
          addRef(postId);
          toast.success(`Added to references (${pendingRefs.length + 1})`, {
            description: 'Will be linked to your next Spark',
          });
        }
      }
    }
  };

  const handlePointerDown = () => {
    longPressTimer.current = setTimeout(() => {
      if (!isDragging) {
        if (onLongPress) {
          onLongPress();
        } else {
          // Dispatch event to open ConstellationView
          window.dispatchEvent(
            new CustomEvent('pb:post:preview', {
              detail: { postId },
            })
          );
        }
      }
    }, 500);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Desktop action handlers
  const handleContinue = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReferenced) {
      removeRef(postId);
    }
    openComposer({ 
      parentPostId: postId, 
      relationType: 'continuation' 
    });
    toast.success(`Continuing: ${postTitle || 'this Spark'}`);
  };

  const handleReference = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReferenced) {
      removeRef(postId);
      toast.info('Removed from references');
    } else {
      addRef(postId);
      toast.success(`Added to references (${pendingRefs.length + 1})`, {
        description: 'Will be linked to your next Spark',
      });
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('pb:post:preview', {
        detail: { postId },
      })
    );
  };

  return (
    <div 
      className={cn("relative group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left action indicator (Continue) - Mobile only */}
      {isMobile && (
        <motion.div
          style={{ opacity: leftOpacity }}
          className="absolute inset-y-0 left-0 w-20 flex items-center justify-center pointer-events-none"
        >
          <div className="flex flex-col items-center gap-1 text-[hsl(var(--accent))]">
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs font-medium">Continue</span>
          </div>
        </motion.div>
      )}

      {/* Right action indicator (Save/Saved) - Mobile only */}
      {isMobile && (
        <motion.div
          style={{ opacity: rightOpacity }}
          className="absolute inset-y-0 right-0 w-20 flex items-center justify-center pointer-events-none"
        >
          <div className={cn(
            "flex flex-col items-center gap-1",
            isReferenced ? "text-green-400" : "text-purple-400"
          )}>
            {isReferenced ? <Check className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
            <span className="text-xs font-medium">
              {isReferenced ? 'Remove' : 'Reference'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Reference indicator badge */}
      {isReferenced && (
        <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] text-purple-300">
          Referenced
        </div>
      )}

      {/* Desktop hover action buttons */}
      {!isMobile && isHovered && !isDragging && (
        <div className="absolute inset-x-0 bottom-0 z-20 p-3 bg-gradient-to-t from-background/90 to-transparent flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleContinue}
            className="h-8 text-xs bg-[hsl(var(--accent))]/10 hover:bg-[hsl(var(--accent))]/20 border border-[hsl(var(--accent))]/30 text-[hsl(var(--accent))]"
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            Continue
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleReference}
            className={cn(
              "h-8 text-xs border",
              isReferenced 
                ? "bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400"
                : "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-400"
            )}
          >
            {isReferenced ? <Check className="w-3 h-3 mr-1" /> : <Bookmark className="w-3 h-3 mr-1" />}
            {isReferenced ? 'Referenced' : 'Reference'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePreview}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Preview
          </Button>
        </div>
      )}

      {/* Swipeable card */}
      <motion.div
        style={{ x, rotate, scale }}
        drag={isMobile ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onPointerDown={isMobile ? handlePointerDown : undefined}
        onPointerUp={isMobile ? handlePointerUp : undefined}
        onPointerLeave={isMobile ? handlePointerUp : undefined}
        whileTap={isMobile ? { scale: 0.98 } : undefined}
        className={cn(
          "relative",
          isMobile && "cursor-grab active:cursor-grabbing touch-pan-y",
          isDragging && "z-10"
        )}
      >
        {children}
        
        {/* Drag hint - Mobile only */}
        {isMobile && !isDragging && (
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
