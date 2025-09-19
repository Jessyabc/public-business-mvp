import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpaceAdapter, type BrainstormPost } from '../adapters/spaceAdapter';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

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

  // ----- rendering helpers
  const CurrentCard = ({ post }: { post: BrainstormPost }) => (
    <Card className="w-[560px] max-w-[92vw] bg-white/10 backdrop-blur-xl border-white/20 text-white shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {post.title || 'PublicBusiness • Brainstorm'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {post.content && <p className="text-white/90 leading-relaxed">{post.content}</p>}
        <div className="flex items-center gap-2 text-xs text-white/60">
          <Badge variant="outline" className="border-white/30 text-white/80">Brainstorm</Badge>
          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" variant="secondary" className="bg-white/15 hover:bg-white/25 text-white/90 border-white/20"
            onClick={jumpLatest}>Jump to latest</Button>
        </div>
      </CardContent>
    </Card>
  );

  const SoftCard = ({ post, onOpen }: { post: BrainstormPost; onOpen: (id: string) => void }) => (
    <button
      onClick={() => onOpen(post.id)}
      className="block text-left w-72 bg-white/8 hover:bg-white/14 transition-colors rounded-xl p-3 border border-white/15 text-white/90"
    >
      <div className="text-sm font-semibold mb-1">{post.title || 'Related brainstorm'}</div>
      {post.content && <div className="text-xs line-clamp-3 text-white/75">{post.content}</div>}
      <div className="mt-2 text-[11px] text-white/60">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</div>
    </button>
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

      {/* Center current */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <CurrentCard post={current} />
      </div>

      {/* Hard link “nexts” as luminous beacons */}
      {forwardNext && (
        <div className="absolute right-10 top-10">
          <div className="mb-2 text-xs uppercase tracking-wide text-[#6fb3ff]">Hard link →</div>
          <div className="w-64 rounded-xl p-[1px] bg-gradient-to-r from-[#3aa0ff] to-white/60">
            <div className="rounded-[10px] bg-[#0b285a]/70 p-3">
              <div className="text-sm font-semibold text-white/90 line-clamp-2">{forwardNext.title || 'Next in thread'}</div>
              {forwardNext.content && <div className="text-xs text-white/70 line-clamp-3 mt-1">{forwardNext.content}</div>}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-white/60">
                  {formatDistanceToNow(new Date(forwardNext.created_at), { addSuffix: true })}
                </span>
                <Button size="sm" variant="secondary"
                  className="h-7 bg-[#3aa0ff]/20 hover:bg-[#3aa0ff]/30 text-white border-[#3aa0ff]/30"
                  onClick={() => setCurrent(forwardNext)}
                >
                  Open
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {backwardNext && (
        <div className="absolute left-10 top-10">
          <div className="mb-2 text-xs uppercase tracking-wide text-white/80">← Previous</div>
          <div className="w-64 rounded-xl p-[1px] bg-gradient-to-r from-white/70 to-white/20">
            <div className="rounded-[10px] bg-[#0b285a]/60 p-3">
              <div className="text-sm font-semibold text-white/90 line-clamp-2">{backwardNext.title || 'Earlier idea'}</div>
              {backwardNext.content && <div className="text-xs text-white/70 line-clamp-3 mt-1">{backwardNext.content}</div>}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-white/60">
                  {formatDistanceToNow(new Date(backwardNext.created_at), { addSuffix: true })}
                </span>
                <Button size="sm" variant="secondary"
                  className="h-7 bg-white/15 hover:bg-white/25 text-white border-white/20"
                  onClick={() => setCurrent(backwardNext)}
                >
                  Open
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Soft neighbors rail */}
      {softNeighbors.length > 0 && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-[320px] space-y-3">
          <div className="text-xs uppercase tracking-wide text-white/70 mb-2">Soft links</div>
          {softNeighbors.slice(0, 5).map(n => (
            <SoftCard key={n.id} post={n} onOpen={(id) => {
              const target = softNeighbors.find(x => x.id === id);
              if (target) setCurrent(target);
            }} />
          ))}
        </div>
      )}

      {/* Hints */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs">
        Scroll to move along hard links • Click a soft card to branch
      </div>
    </div>
  );
}
