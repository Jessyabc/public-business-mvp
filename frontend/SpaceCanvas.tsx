import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/ui/components/GlassCard';
import { SpaceAdapter, type BrainstormPost } from '../adapters/spaceAdapter';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { NodeForm } from './NodeForm';
import { Plus, ArrowRight, Eye, RefreshCw } from 'lucide-react';
import { BRAINSTORM_WRITES_ENABLED } from '@/config/flags';
import { viewPost } from '../adapters/supabaseAdapter';
import { toast } from 'sonner';
import { useBrainstormStore } from '../store';

type Props = {
  /** Optional: start on this post id if provided */
  startId?: string;
  className?: string;
};

export default function SpaceCanvas({ startId, className }: Props) {
  const adapter = useMemo(() => new SpaceAdapter(), []);
  const { isLoadingGraph, graphError, setLoading, setError } = useBrainstormStore();
  const [current, setCurrent] = useState<BrainstormPost | null>(null);
  const [forwardNext, setForwardNext] = useState<BrainstormPost | null>(null);
  const [softNeighbors, setSoftNeighbors] = useState<BrainstormPost[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showContinueForm, setShowContinueForm] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // ----- helpers
  const pickNext = (list: BrainstormPost[], excludeId?: string) =>
    list.find(p => p.id !== excludeId) ?? null;

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (startId) {
        // try startId; if not found, fallback to recent
        const latest = await adapter.latestHard(startId).catch(() => null);
        const base = latest ?? (await adapter.recent(1))[0] ?? null;
        if (base) {
          setCurrent(base);
        } else {
          setCurrent(null);
        }
      } else {
        const rec = await adapter.recent(1);
        setCurrent(rec[0] ?? null);
      }
    } catch (error) {
      console.error('Failed to load graph:', error);
      setError('Failed to load brainstorms');
    } finally {
      setLoading(false);
    }
  }, [adapter, startId, setLoading, setError]);

  const loadContext = useCallback(async (nodeId: string) => {
    // load neighbors around current node
    const [fwd, soft] = await Promise.all([
      adapter.hardChain(nodeId, 'forward', 2),
      adapter.softNeighbors(nodeId, 8),
    ]);
    setForwardNext(pickNext(fwd, nodeId));
    setSoftNeighbors(soft.filter(p => p.id !== nodeId));
    adapter.trackOpen(nodeId).catch(() => {});
    
    // Track view
    viewPost(nodeId).catch(() => {});
  }, [adapter]);

  const goForward = useCallback(async () => {
    if (current?.id && forwardNext) {
      setCurrent(forwardNext);
      return;
    }
    // fallback when no hard links yet: move by recency
    const rec = await adapter.recent(10);
    if (current) {
      const idx = rec.findIndex(p => p.id === current.id);
      const next = idx >= 0 ? rec[idx + 1] : rec[1];
      if (next) setCurrent(next);
    } else if (rec[0]) {
      setCurrent(rec[0]);
    }
  }, [adapter, current, forwardNext]);


  const jumpLatest = useCallback(async () => {
    if (!current) return;
    const latest = await adapter.latestHard(current.id);
    if (latest) setCurrent(latest);
  }, [adapter, current]);

  // Scroll = infinite scroll through brainstorms
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      setScrollPosition(prev => prev + e.deltaY);
    };
    el.addEventListener('wheel', onWheel, { passive: true });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Initial node
  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  // When current changes, load its context
  useEffect(() => {
    if (current?.id) void loadContext(current.id);
  }, [current?.id, loadContext]);

  // ----- rendering helpers
  const CurrentCard = ({ post }: { post: BrainstormPost }) => (
    <GlassCard 
      className="w-full max-w-2xl backdrop-blur-xl border-foreground/20 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]"
      padding="lg"
    >
      <h2 className="text-2xl font-semibold text-foreground mb-4">
        {post.title || 'PublicBusiness • Brainstorm'}
      </h2>
      
      <div className="space-y-4">
        {post.content && (
          <p className="text-foreground/90 leading-relaxed text-base">{post.content}</p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-foreground/70">
          <Badge 
            variant="outline" 
            className="border-foreground/30 bg-foreground/10 text-foreground/90 backdrop-blur-sm hover:bg-foreground/15 transition-colors"
          >
            Brainstorm
          </Badge>
          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
          
          {/* View counter */}
          <div className="flex items-center gap-1.5 text-foreground/60 ml-auto">
            <Eye className="w-4 h-4" />
            <span className="text-xs">{post.views_count ?? 0}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          {BRAINSTORM_WRITES_ENABLED && (
            <Button 
              size="sm"
              onClick={() => setShowContinueForm(true)}
              className="bg-primary/25 hover:bg-primary/40 active:bg-primary/50 text-white border border-primary/40 backdrop-blur-sm transition-all shadow-lg"
            >
              <ArrowRight className="w-4 h-4 mr-1" />
              Continue here
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost"
            className="bg-background/15 hover:bg-background/25 active:bg-background/30 text-foreground border border-foreground/20 backdrop-blur-sm transition-all shadow-lg"
            onClick={jumpLatest}
          >
            Jump to latest
          </Button>
        </div>
      </div>
    </GlassCard>
  );

  const SoftCard = ({ post, onOpen }: { post: BrainstormPost; onOpen: (id: string) => void }) => (
    <GlassCard
      interactive
      padding="sm"
      onClick={() => onOpen(post.id)}
      className="w-full backdrop-blur-md border-dashed border-accent/40 opacity-80 hover:opacity-100 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] hover:ring-2 hover:ring-accent/40"
      asChild
    >
      <button className="text-left">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="text-sm font-semibold text-foreground/95">
            {post.title || 'Related brainstorm'}
          </div>
          <Badge variant="outline" className="text-[10px] border-accent/30 text-accent px-1.5 py-0">
            soft
          </Badge>
        </div>
        {post.content && (
          <div className="text-xs line-clamp-3 text-foreground/75 leading-relaxed mb-2">
            {post.content}
          </div>
        )}
        <div className="text-[11px] text-foreground/60">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </div>
      </button>
    </GlassCard>
  );

  // Loading overlay
  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
        <p className="text-foreground/70 text-sm">Loading graph…</p>
      </div>
    </div>
  );

  // Error state
  if (graphError) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'relative h-[calc(100vh-64px)] w-full overflow-hidden',
          'bg-gradient-to-br from-background via-background to-primary/5',
          'select-none'
        )}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.015] mix-blend-overlay [background-image:url(/noise.png)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-foreground/70">
          <p>Something went wrong. Please try refreshing.</p>
          <Button onClick={() => loadInitial()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!current && !isLoadingGraph) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'relative h-[calc(100vh-64px)] w-full overflow-hidden',
          'bg-gradient-to-br from-background via-background to-primary/5',
          'select-none'
        )}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.015] mix-blend-overlay [background-image:url(/noise.png)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-foreground/70">
          <p className="text-center max-w-md">No brainstorms yet. Create one to start connecting ideas.</p>
          {BRAINSTORM_WRITES_ENABLED && (
            <Button onClick={() => setShowNewForm(true)} className="bg-primary/30 hover:bg-primary/45">
              <Plus className="w-4 h-4 mr-2" />
              New Brainstorm
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-[calc(100vh-64px)] w-full overflow-hidden',
        'bg-gradient-to-br from-background via-background to-primary/5',
        'select-none caret-transparent',
        className
      )}
    >
      {/* Glass noise overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.015] mix-blend-overlay [background-image:url(/noise.png)]" />

      {/* Loading overlay */}
      {isLoadingGraph && <LoadingOverlay />}

      {/* Header controls */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {BRAINSTORM_WRITES_ENABLED && (
          <Button
            onClick={() => setShowNewForm(true)}
            className="bg-primary/30 hover:bg-primary/45 text-white border border-primary/50 backdrop-blur-lg shadow-[0_4px_16px_rgba(72,159,227,0.3)] transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Brainstorm
          </Button>
        )}
        <Button
          onClick={() => loadInitial()}
          variant="outline"
          size="icon"
          className="bg-background/20 hover:bg-background/30 border-foreground/20 backdrop-blur-lg transition-all"
          title="Refresh Graph"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Center current with fade-in - only render if current exists */}
      {current && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-fade-in">
          <CurrentCard post={current} />
        </div>
      )}

      {/* Hard link "nexts" with glowing connection line */}
      {forwardNext && (
        <>
          {/* Glowing blue metallic line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              <linearGradient id="hardLinkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
              </linearGradient>
              <filter id="hardLinkGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <line
              x1="50%"
              y1="50%"
              x2="calc(100% - 160px)"
              y2="80px"
              stroke="url(#hardLinkGradient)"
              strokeWidth="2"
              filter="url(#hardLinkGlow)"
              className="transition-all duration-700 ease-out"
              strokeDasharray="1000"
              strokeDashoffset="0"
            />
          </svg>

          <div className="absolute right-8 top-8 animate-fade-in">
            <div className="mb-2 text-xs uppercase tracking-wide text-foreground/70 font-medium">
              Hard link →
            </div>
            <GlassCard 
              padding="sm"
              className="w-72 backdrop-blur-lg border-primary/40 shadow-[0_8px_24px_hsl(var(--primary)/0.25),inset_0_1px_0_rgba(255,255,255,0.1)] ring-2 ring-primary/20"
            >
              <div className="text-sm font-semibold text-foreground/95 line-clamp-2 mb-2">
                {forwardNext.title || 'Next in thread'}
              </div>
              {forwardNext.content && (
                <div className="text-xs text-foreground/75 line-clamp-3 mb-3 leading-relaxed">
                  {forwardNext.content}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-foreground/60">
                  {formatDistanceToNow(new Date(forwardNext.created_at), { addSuffix: true })}
                </span>
                <Button 
                  size="sm"
                  className="h-7 bg-primary/25 hover:bg-primary/40 active:bg-primary/50 text-white border border-primary/40 backdrop-blur-sm transition-all shadow-lg"
                  onClick={() => setCurrent(forwardNext)}
                >
                  Open
                </Button>
              </div>
            </GlassCard>
          </div>
        </>
      )}
      {/* Soft neighbors rail - full height on left */}
      {softNeighbors.length > 0 && (
        <div className="absolute left-8 top-0 bottom-0 w-80 py-8 flex flex-col animate-fade-in">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="text-xs uppercase tracking-wide text-foreground/80 font-medium">
              Soft links
            </div>
            <div className="h-[1px] flex-1 border-t border-dashed border-accent/40" />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 scrollbar-thin scrollbar-thumb-foreground/20 scrollbar-track-transparent">
            {softNeighbors.map(n => (
              <SoftCard key={n.id} post={n} onOpen={(id) => {
                const target = softNeighbors.find(x => x.id === id);
                if (target) setCurrent(target);
              }} />
            ))}
          </div>
        </div>
      )}

      {/* Hints */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-foreground/70 text-xs">
        Scroll to move along hard links • Click a soft card to branch
      </div>

      {/* Modals */}
      <NodeForm
        open={showNewForm}
        onOpenChange={setShowNewForm}
        mode="root"
      />
      <NodeForm
        open={showContinueForm}
        onOpenChange={setShowContinueForm}
        mode="continue"
        parentId={current?.id}
      />
    </div>
  );
}
