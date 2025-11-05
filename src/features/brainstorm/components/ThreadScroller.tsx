import { motion, useAnimation } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useBrainstormStore } from '../store';
import { GlassCard } from '@/ui/components/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * ThreadScroller - Infinite slider with orbs moving along hard links
 * 
 * Features:
 * - PB-glow hard link lines (animated gradient with filter)
 * - Moving orbs that travel along the hard link path
 * - Dotted soft handoff indicators
 * - Smooth infinite scroll with mouse wheel
 */
export default function ThreadScroller() {
  const { threadNodes, currentIndex, goNextInThread, goPrevInThread } = useBrainstormStore();
  const [scrollOffset, setScrollOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbControls = useAnimation();

  const current = threadNodes[currentIndex];
  const next = threadNodes[currentIndex + 1];
  const softLinks = useBrainstormStore((s) => s.softLinksForSelected());

  // Animate orb along the hard link path
  useEffect(() => {
    if (next) {
      orbControls.start({
        x: ['50%', 'calc(100% - 180px)'],
        transition: {
          duration: 2.5,
          repeat: Infinity,
          ease: 'linear',
        },
      });
    }
  }, [next, orbControls]);

  // Mouse wheel navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY;
      
      if (delta > 0 && next) {
        goNextInThread();
      } else if (delta < 0 && currentIndex > 0) {
        goPrevInThread();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [currentIndex, next, goNextInThread, goPrevInThread]);

  if (!current) return null;

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 select-none"
    >
      {/* Noise texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.015] mix-blend-overlay [background-image:url(/noise.png)]" />

      {/* Current card - Center */}
      <motion.div
        key={current.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
      >
        <GlassCard className="w-full max-w-2xl backdrop-blur-xl border-foreground/20 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] p-8 md:p-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {current.title || 'Untitled'}
          </h2>
          <div className="space-y-4">
            <p className="text-foreground/90 leading-relaxed text-base">
              {current.content || 'No content'}
            </p>
            <div className="flex items-center gap-4 text-sm text-foreground/70">
              <Badge className="border-foreground/30 bg-foreground/10 text-foreground/90 backdrop-blur-sm hover:bg-foreground/15 transition-colors">
                Brainstorm
              </Badge>
              <span>
                {current.created_at
                  ? formatDistanceToNow(new Date(current.created_at), { addSuffix: true })
                  : 'Recently'}
              </span>
              <div className="flex items-center gap-3 ml-auto">
                <button className="flex items-center gap-1.5 transition-colors hover:text-red-300 cursor-pointer">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs">{current.likes_count || 0}</span>
                </button>
                <div className="flex items-center gap-1.5 text-foreground/60">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs">{current.views_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Hard link: PB-glow animated line with orbs */}
      {next && (
        <>
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              {/* PB-glow gradient */}
              <linearGradient id="pbGlowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--pb-blue))" stopOpacity="0.4" />
                <stop offset="50%" stopColor="hsl(var(--pb-aqua))" stopOpacity="0.95" />
                <stop offset="100%" stopColor="hsl(var(--pb-blue))" stopOpacity="0.4" />
              </linearGradient>
              {/* Glow filter */}
              <filter id="pbGlow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Animated hard link line */}
            <motion.line
              x1="50%"
              y1="50%"
              x2="calc(100% - 160px)"
              y2="80px"
              stroke="url(#pbGlowGradient)"
              strokeWidth="3"
              filter="url(#pbGlow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />
          </svg>

          {/* Moving orb along the hard link */}
          <motion.div
            animate={orbControls}
            className="absolute top-[50%] -translate-y-1/2 w-3 h-3 rounded-full bg-[hsl(var(--pb-aqua))] shadow-[0_0_12px_hsl(var(--pb-aqua)),0_0_24px_hsl(var(--pb-aqua))] z-15"
            style={{ left: '50%' }}
          />

          {/* Next card in thread (top-right) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute right-8 top-8 z-20"
          >
            <div className="mb-2 text-xs uppercase tracking-wide text-foreground/70 font-medium">
              Hard link →
            </div>
            <GlassCard className="w-72 backdrop-blur-lg border-primary/40 shadow-[0_8px_24px_hsl(var(--pb-blue)/0.35),inset_0_1px_0_rgba(255,255,255,0.1)] ring-2 ring-[hsl(var(--pb-blue))]/20 p-4 cursor-pointer hover:ring-[hsl(var(--pb-aqua))]/40 transition-all">
              <div className="text-sm font-semibold text-foreground/95 line-clamp-2 mb-2">
                {next.title || 'Next in thread'}
              </div>
              <div className="text-xs text-foreground/75 line-clamp-3 mb-3 leading-relaxed">
                {next.content || 'Continue reading...'}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-foreground/60">
                  {next.created_at
                    ? formatDistanceToNow(new Date(next.created_at), { addSuffix: true })
                    : 'Recently'}
                </span>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}

      {/* Soft links: Dotted handoff indicators (left side) */}
      {softLinks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="absolute left-8 top-0 bottom-0 w-80 py-8 flex flex-col z-20"
        >
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="text-xs uppercase tracking-wide text-foreground/80 font-medium">
              Soft links
            </div>
            <div className="h-[1px] flex-1 border-t border-dashed border-accent/40" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 scrollbar-thin scrollbar-thumb-foreground/20 scrollbar-track-transparent">
            {softLinks.map((link) => (
              <motion.div
                key={link.child_post_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <GlassCard className="w-full backdrop-blur-md border-dashed border-accent/40 opacity-80 hover:opacity-100 shadow-lg hover:shadow-xl transition-all hover:ring-2 hover:ring-accent/40 p-4 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="text-sm font-semibold text-foreground/95">
                      {link.child_title || 'Related brainstorm'}
                    </div>
                    <Badge className="text-[10px] border-accent/30 text-accent px-1.5 py-0">
                      soft
                    </Badge>
                  </div>
                  <div className="text-xs line-clamp-3 text-foreground/75 leading-relaxed mb-2">
                    Click to explore this branch
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-foreground/60">
                      {link.child_like_count || 0} likes
                    </span>
                  </div>
                </GlassCard>

                {/* Dotted soft handoff line */}
                <svg className="absolute left-80 top-1/2 w-32 h-2 pointer-events-none">
                  <line
                    x1="0"
                    y1="1"
                    x2="128"
                    y2="1"
                    stroke="hsl(var(--accent))"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.4"
                  />
                </svg>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Help text */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-foreground/70 text-xs">
        Scroll to move along hard links • Click a soft card to branch
      </div>
    </div>
  );
}
