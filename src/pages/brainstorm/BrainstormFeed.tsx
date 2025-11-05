import { useEffect, useState } from 'react';
import { GlobalBackground } from '@/components/layout/GlobalBackground';
import ThreadScroller from '@/features/brainstorm/components/ThreadScroller';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { useBrainstormStore } from '@/features/brainstorm/store';
import { getBrainstormGraph } from '@/features/brainstorm/adapters/supabaseAdapter';
import { GlowDefs } from '@/components/graphics/GlowDefs';
import { Loader2, RefreshCcw } from 'lucide-react';
import { NodeForm } from '@/features/brainstorm/components/NodeForm';
import { LinkPicker } from '@/features/brainstorm/components/LinkPicker';

export default function BrainstormFeed() {
  const { setNodes, setEdges, nodes, selectById, clearThread } = useBrainstormStore();
  const [isLoading, setIsLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<'root' | 'continue'>('root');
  const [composerParentId, setComposerParentId] = useState<string | null>(null);
  const [linkPickerOpen, setLinkPickerOpen] = useState(false);
  const [linkSourceId, setLinkSourceId] = useState<string | null>(null);

  const pickInitial = (nodes: any[], edges: any[]) => {
    const byNew = [...nodes].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    // choose newest with at least one hard edge
    const withHard = byNew.find(n =>
      edges.some(e =>
        e.type === 'hard' && (e.source === n.id || e.target === n.id)
      )
    );
    return withHard ?? byNew[0];
  };

  const loadGraph = async () => {
    setIsLoading(true);
    try {
      const payload = await getBrainstormGraph();
      setNodes(payload.nodes);
      setEdges(payload.edges);
      const initial = pickInitial(payload.nodes, payload.edges);
      if (initial?.id) selectById(initial.id);
    } catch (e) {
      console.error('Failed to load brainstorm graph:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadGraph(); }, []);

  // Listen for Continue and Link events from ThreadScroller
  useEffect(() => {
    const handleContinue = (e: any) => {
      const parentId = e.detail.parentId;
      setComposerMode('continue');
      setComposerParentId(parentId);
      setComposerOpen(true);
    };

    const handleLink = (e: any) => {
      const sourceId = e.detail.sourceId;
      setLinkSourceId(sourceId);
      setLinkPickerOpen(true);
    };

    const handleReload = () => {
      loadGraph();
    };

    window.addEventListener('pb:brainstorm:continue', handleContinue);
    window.addEventListener('pb:brainstorm:link', handleLink);
    window.addEventListener('pb:brainstorm:reload', handleReload);

    return () => {
      window.removeEventListener('pb:brainstorm:continue', handleContinue);
      window.removeEventListener('pb:brainstorm:link', handleLink);
      window.removeEventListener('pb:brainstorm:reload', handleReload);
    };
  }, []);

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

      {/* NodeForm Modal */}
      <NodeForm
        open={composerOpen}
        onOpenChange={(open) => {
          setComposerOpen(open);
          if (!open) {
            setComposerParentId(null);
          }
        }}
        mode={composerMode}
        parentId={composerParentId}
      />

      {/* LinkPicker Modal */}
      <LinkPicker
        open={linkPickerOpen}
        onOpenChange={(open) => {
          setLinkPickerOpen(open);
          if (!open) {
            setLinkSourceId(null);
          }
        }}
        sourceId={linkSourceId}
      />
    </main>
  );
}
