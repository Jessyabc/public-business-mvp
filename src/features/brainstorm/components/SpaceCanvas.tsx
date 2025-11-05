import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/ui/components/GlassCard';
import { SpaceAdapter, type BrainstormPost } from '../adapters/spaceAdapter';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { NodeForm } from './NodeForm';
import { Plus, ArrowRight, Heart, Eye } from 'lucide-react';
import { BRAINSTORM_WRITES_ENABLED } from '@/config/flags';
import { likePost, viewPost } from '../adapters/supabaseAdapter';
import { toast } from 'sonner';

type Props = {
  /** Optional: start on this post id if provided */
  startId?: string;
  className?: string;
};

export default function SpaceCanvas({ startId, className }: Props) {
  const adapter = useMemo(() => new SpaceAdapter(), []);
  const [current, setCurrent] = useState<BrainstormPost | null>(null);
  const [forwardNext, setForwardNext] = useState<BrainstormPost | null>(null);
  const [backwardNext, setBackwardNext] = useState<BrainstormPost | null>(null);
  const [softNeighbors, setSoftNeighbors] = useState<BrainstormPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showContinueForm, setShowContinueForm] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // ----- helpers
  const pickNext = (list: BrainstormPost[], excludeId?: string) =>
    list.find(p => p.id !== excludeId) ?? null;

  const loadInitial = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [adapter, startId]);

  const loadContext = useCallback(async (nodeId: string) => {
    // load neighbors around current node
    const [fwd, bwd, soft] = await Promise.all([
      adapter.hardChain(nodeId, 'forward', 2),
      adapter.hardChain(nodeId, 'backward', 2),
      adapter.softNeighbors(nodeId, 8),
    ]);
    setForwardNext(pickNext(fwd, nodeId));
    setBackwardNext(pickNext(bwd, nodeId));
    setSoftNeighbors(soft.filter(p => p.id !== nodeId));
    adapter.trackOpen(nodeId).catch(() => {});
    
    // Track view
    viewPost(nodeId).catch(() => {});
    setHasLiked(false); // Reset like state when viewing new node
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

  const goBackward = useCallback(async () => {
    if (current?.id && backwardNext) {
      setCurrent(backwardNext);
      return;
    }
    // fallback: previous by recency (reverse)
    const rec = await adapter.recent(10);
    if (current) {
      const idx = rec.findIndex(p => p.id === current.id);
      const prev = idx > 0 ? rec[idx - 1] : null;
      if (prev) setCurrent(prev);
    } else if (rec[0]) {
      setCurrent(rec[0]);
    }
  }, [adapter, current, backwardNext]);

  const jumpLatest = useCallback(async () => {
    if (!current) return;
    const latest = await adapter.latestHard(current.id);
    if (latest) setCurrent(latest);
  }, [adapter, current]);

  // Wheel = traverse hard chain
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // prevent page scroll and treat as depth move
      e.preventDefault();
      if (e.deltaY > 0) {
        void goForward();
      } else {
        void goBackward();
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel as any);
  }, [goForward, goBackward]);

  // Initial node
  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  // When current changes, load its context
  useEffect(() => {
    if (current?.id) void loadContext(current.id);
  }, [current?.id, loadContext]);

  // Handle like interaction
  const handleLike = async () => {
    if (!current?.id || hasLiked) return;
    
    try {
      await likePost(current.id);
      // Optimistic update
      setCurrent(prev => prev ? { ...prev, likes_count: (prev.likes_count ?? 0) + 1 } : null);
      setHasLiked(true);
      toast.success('Liked!');
    } catch (err) {
      toast.error('You must be logged in to like');
    }
  };

  // ----- rendering helpers
  const CurrentCard = ({ post }: { post: BrainstormPost }) => (
    <GlassCard 
      className="w-full max-w-2xl backdrop-blur-xl border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]"
      padding="lg"
    >
      <h2 className="text-2xl font-semibold text-white mb-4">
        {post.title || 'PublicBusiness • Brainstorm'}
      </h2>
      
      <div className="space-y-4">
        {post.content && (
          <p className="text-white/90 leading-relaxed text-base">{post.content}</p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-white/70">
          <Badge 
            variant="outline" 
            className="border-white/30 bg-white/10 text-white/90 backdrop-blur-sm hover:bg-white/15 transition-colors"
          >
            Brainstorm
          </Badge>
          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
          
          {/* Interaction counters */}
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={handleLike}
              disabled={hasLiked}
              className={cn(
                "flex items-center gap-1.5 transition-colors",
                hasLiked 
                  ? "text-red-400 cursor-not-allowed" 
                  : "hover:text-red-300 cursor-pointer"
              )}
            >
              <Heart className={cn("w-4 h-4", hasLiked && "fill-current")} />
              <span className="text-xs">{post.likes_count ?? 0}</span>
            </button>
            <div className="flex items-center gap-1.5 text-white/60">
              <Eye className="w-4 h-4" />
              <span className="text-xs">{post.views_count ?? 0}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          {BRAINSTORM_WRITES_ENABLED && (
            <Button 
              size="sm"
              onClick={() => setShowContinueForm(true)}
              className="bg-[#3aa0ff]/25 hover:bg-[#3aa0ff]/40 active:bg-[#3aa0ff]/50 text-white border border-[#3aa0ff]/40 backdrop-blur-sm transition-all shadow-lg"
            >
              <ArrowRight className="w-4 h-4 mr-1" />
              Continue here
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost"
            className="bg-white/15 hover:bg-white/25 active:bg-white/30 text-white border border-white/20 backdrop-blur-sm transition-all shadow-lg"
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
      className="w-full backdrop-blur-md border-dashed border-white/15 opacity-80 hover:opacity-100 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
      asChild
    >
      <button className="text-left">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="text-sm font-semibold text-white/95">
            {post.title || 'Related brainstorm'}
          </div>
          <Badge variant="outline" className="text-[10px] border-white/20 text-white/60 px-1.5 py-0">
            soft
          </Badge>
        </div>
        {post.content && (
          <div className="text-xs line-clamp-3 text-white/75 leading-relaxed mb-2">
            {post.content}
          </div>
        )}
        <div className="text-[11px] text-white/60">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </div>
      </button>
    </GlassCard>
  );

  if (loading) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'relative h-[calc(100vh-64px)] w-full overflow-hidden',
          'bg-[#061a3a] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(32,106,255,0.15),transparent_45%)]',
          'select-none'
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center text-white/70">Loading brainstorm space…</div>
      </div>
    );
  }

  if (!current) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'relative h-[calc(100vh-64px)] w-full overflow-hidden',
          'bg-[#061a3a] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(32,106,255,0.15),transparent_45%)]',
          'select-none'
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center text-white/70">No brainstorms yet.</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-[calc(100vh-64px)] w-full overflow-hidden',
        'bg-[#061a3a] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(32,106,255,0.15),transparent_45%)]',
        'select-none caret-transparent cursor-grab active:cursor-grabbing',
        className
      )}
    >
      {/* Stars layer */}
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(1px_1px_at_20%_30%,rgba(255,255,255,0.25),transparent_1px),radial-gradient(1px_1px_at_60%_70%,rgba(255,255,255,0.2),transparent_1px)] opacity-60" />

      {/* Floating "New Brainstorm" button */}
      {BRAINSTORM_WRITES_ENABLED && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
          <Button
            onClick={() => setShowNewForm(true)}
            className="bg-[#3aa0ff]/30 hover:bg-[#3aa0ff]/45 text-white border border-[#3aa0ff]/50 backdrop-blur-lg shadow-[0_4px_16px_rgba(58,160,255,0.3)] transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Brainstorm
          </Button>
        </div>
      )}

      {/* Center current */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <CurrentCard post={current} />
      </div>

      {/* Hard link “nexts” as luminous beacons */}
      {forwardNext && (
        <div className="absolute right-8 top-8">
          <div className="mb-2 text-xs uppercase tracking-wide text-white/70 font-medium">
            Hard link →
          </div>
          <GlassCard 
            padding="sm"
            className="w-72 backdrop-blur-lg border-[#3aa0ff]/40 shadow-[0_8px_24px_rgba(58,160,255,0.25),inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <div className="text-sm font-semibold text-white/95 line-clamp-2 mb-2">
              {forwardNext.title || 'Next in thread'}
            </div>
            {forwardNext.content && (
              <div className="text-xs text-white/75 line-clamp-3 mb-3 leading-relaxed">
                {forwardNext.content}
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/60">
                {formatDistanceToNow(new Date(forwardNext.created_at), { addSuffix: true })}
              </span>
              <Button 
                size="sm"
                className="h-7 bg-[#3aa0ff]/25 hover:bg-[#3aa0ff]/40 active:bg-[#3aa0ff]/50 text-white border border-[#3aa0ff]/40 backdrop-blur-sm transition-all shadow-lg"
                onClick={() => setCurrent(forwardNext)}
              >
                Open
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
      {backwardNext && (
        <div className="absolute left-8 top-8">
          <div className="mb-2 text-xs uppercase tracking-wide text-white/70 font-medium">
            ← Previous
          </div>
          <GlassCard 
            padding="sm"
            className="w-72 backdrop-blur-lg border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <div className="text-sm font-semibold text-white/95 line-clamp-2 mb-2">
              {backwardNext.title || 'Earlier idea'}
            </div>
            {backwardNext.content && (
              <div className="text-xs text-white/75 line-clamp-3 mb-3 leading-relaxed">
                {backwardNext.content}
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/60">
                {formatDistanceToNow(new Date(backwardNext.created_at), { addSuffix: true })}
              </span>
              <Button 
                size="sm"
                className="h-7 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white border border-white/20 backdrop-blur-sm transition-all shadow-lg"
                onClick={() => setCurrent(backwardNext)}
              >
                Open
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Soft neighbors rail */}
      {softNeighbors.length > 0 && (
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-80 space-y-3">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="text-xs uppercase tracking-wide text-white/80 font-medium">
              Soft links
            </div>
            <div className="h-[1px] flex-1 border-t border-dashed border-white/30" />
          </div>
          <div className="space-y-2.5">
            {softNeighbors.slice(0, 5).map(n => (
              <SoftCard key={n.id} post={n} onOpen={(id) => {
                const target = softNeighbors.find(x => x.id === id);
                if (target) setCurrent(target);
              }} />
            ))}
          </div>
        </div>
      )}

      {/* Hints */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs">
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
