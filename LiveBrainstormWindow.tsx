import { useState, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Users, Activity, Sparkles, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAppMode } from '@/contexts/AppModeContext';
import { useBrainstorms, type Brainstorm } from '@/hooks/useBrainstorms';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface LiveBrainstormWindowProps {
  dense?: boolean;
  className?: string;
}

interface BrainstormBubbleProps {
  brainstorm: Brainstorm;
  dense?: boolean;
  onNavigate: (id: string) => void;
}

const BrainstormBubble = memo(({ brainstorm, dense = false, onNavigate }: BrainstormBubbleProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [showQuickPeek, setShowQuickPeek] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovering(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate(brainstorm.id);
  };

  const participantsCount = 1; // Author only
  const isActive = false;

  return (
    <div className="relative">
      <motion.div
        className={cn(
          'relative group cursor-pointer',
          dense ? 'min-w-[220px] max-w-[220px]' : 'min-w-[280px] max-w-[280px]'
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={cn(
          'glass-low p-4 border border-border/40 transition-all duration-300 snap-center',
          'hover:border-primary/40 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          dense ? 'h-24' : 'h-32'
        )}
        tabIndex={0}
        role="button"
        aria-label={`View brainstorm: ${brainstorm.title}`}
        >
          {/* Active Indicator */}
          {isActive && (
            <motion.div
              className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          {/* Content */}
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-2">
              <Brain className="w-4 h-4 text-primary shrink-0" />
            </div>

            <h4 className={cn(
              'font-semibold text-foreground group-hover:text-primary transition-colors',
              dense ? 'text-xs line-clamp-2' : 'text-sm line-clamp-2'
            )}>
              {brainstorm.title}
            </h4>

            <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {participantsCount > 1 && (
                  <>
                    <Users className="w-3 h-3" />
                    {participantsCount}
                  </>
                )}
              </span>
              <span>{formatDistanceToNow(new Date(brainstorm.created_at), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Hover Arrow */}
          <motion.div
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ x: -5 }}
            animate={{ x: 0 }}
          >
            <ChevronRight className="w-4 h-4 text-primary" />
          </motion.div>
        </Card>
      </motion.div>

      {/* Hover Preview Popover */}
      {!dense && (
        <Popover open={isHovering} onOpenChange={setIsHovering}>
          <PopoverTrigger asChild>
            <div className="absolute inset-0 pointer-events-none" />
          </PopoverTrigger>
          <PopoverContent 
            className="glass-med w-80 p-4"
            side="top"
            align="center"
            sideOffset={8}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{brainstorm.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {brainstorm.content}
                  </p>
                </div>


                <Button
                  size="sm"
                  variant="outline"
                  className="w-full glass-low"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQuickPeek(!showQuickPeek);
                  }}
                >
                  <Sparkles className="w-3 h-3 mr-2" />
                  Quick Peek
                </Button>
              </div>
            </motion.div>
          </PopoverContent>
        </Popover>
      )}

      {/* Quick Peek Accordion Expansion */}
      <AnimatePresence>
        {showQuickPeek && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="glass-low mt-2 p-4 border border-border/40">
              <p className="text-sm text-foreground mb-3">{brainstorm.content}</p>
              <Button
                size="sm"
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleClick}
              >
                View Full Brainstorm
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

BrainstormBubble.displayName = 'BrainstormBubble';

export function LiveBrainstormWindow({ dense = false, className }: LiveBrainstormWindowProps) {
  const { brainstorms, loading } = useBrainstorms();
  const { setMode } = useAppMode();
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver>();
  const [visibleCount, setVisibleCount] = useState(6);

  const handleNavigate = useCallback((brainstormId: string) => {
    // Switch mode first
    setMode('public');
    
    // Small delay for theme transition
    setTimeout(() => {
      navigate(`/brainstorms/${brainstormId}`);
      
      // DEV toast - can be toggled via feature flag
      if (import.meta.env.DEV) {
        console.log('Switched to Brainstorm mode');
      }
    }, 300);
  }, [setMode, navigate]);

  const lastBubbleRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < brainstorms.length) {
        setVisibleCount(prev => Math.min(prev + 6, brainstorms.length));
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, visibleCount, brainstorms.length]);

  const visibleBrainstorms = brainstorms.slice(0, visibleCount);

  if (loading) {
    return (
      <div className={cn('glass-med rounded-xl p-6', className)}>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className={cn(
                'glass-low rounded-lg animate-pulse',
                dense ? 'min-w-[220px] h-24' : 'min-w-[280px] h-32'
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  if (brainstorms.length === 0) {
    return (
      <div className={cn('glass-med rounded-xl p-6', className)}>
        <div className="text-center py-8">
          <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">No brainstorms available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn('glass-med rounded-xl p-6', className)}
      style={{ 
        // @ts-expect-error - CSS custom property
        '--reduced-motion-scale': '0.99'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            {dense ? 'Live Brainstorms' : 'Live Brainstorm Window'}
          </h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          {brainstorms.length} active
        </Badge>
      </div>

      <div 
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {visibleBrainstorms.map((brainstorm, index) => (
          <div
            key={brainstorm.id}
            ref={index === visibleBrainstorms.length - 1 ? lastBubbleRef : undefined}
          >
            <BrainstormBubble
              brainstorm={brainstorm}
              dense={dense}
              onNavigate={handleNavigate}
            />
          </div>
        ))}
      </div>

      {visibleCount < brainstorms.length && (
        <div className="text-center mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisibleCount(prev => Math.min(prev + 6, brainstorms.length))}
            className="glass-low"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
