import { useEffect, useState } from 'react';
import { GlobalBackground } from '@/components/layout/GlobalBackground';
import ThreadScroller from '@/features/brainstorm/components/ThreadScroller';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { useBrainstormStore } from '@/features/brainstorm/store';
import { getBrainstormGraph } from '@/features/brainstorm/adapters/supabaseAdapter';
import { GlowDefs } from '@/components/graphics/GlowDefs';
import { Loader2, RefreshCcw } from 'lucide-react';

export default function BrainstormFeed() {
  const { setNodes, setEdges, nodes, selectById, clearThread } = useBrainstormStore();
  const [isLoading, setIsLoading] = useState(true);

  const loadGraph = async () => {
    setIsLoading(true);
    try {
      const payload = await getBrainstormGraph();
      setNodes(payload.nodes);
      setEdges(payload.edges);

      const mostRecent = [...payload.nodes].sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      )[0];
      if (mostRecent?.id) selectById(mostRecent.id);
    } catch (e) {
      console.error('Failed to load brainstorm graph:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadGraph(); }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <GlobalBackground />
      <GlowDefs />

      {/* Refresh */}
      <div className="absolute z-20 left-4 top-3 flex items-center gap-2">
        <button
          onClick={async () => { clearThread(); await loadGraph(); }}
          className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10"
        >
          <RefreshCcw size={16}/> Refresh
        </button>
      </div>

      <div className="grid grid-cols-[70%_30%] gap-0 h-screen">
        <section className="relative overflow-hidden p-4 md:p-6">
          {nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full text-foreground/70">
              <div className="text-center">
                <p className="text-lg mb-2">No brainstorms yet</p>
                <p className="text-sm text-foreground/50">Create your first brainstorm to get started</p>
              </div>
            </div>
          ) : (
            <ThreadScroller />
          )}
        </section>
        <aside className="border-l border-border/50 bg-background/50 backdrop-blur-sm overflow-hidden">
          <RightSidebar variant="feed" />
        </aside>
      </div>
    </main>
  );
}
