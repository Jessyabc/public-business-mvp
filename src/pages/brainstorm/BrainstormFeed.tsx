import { useCallback, useEffect, useState } from 'react';

import { GlobalBackground } from '@/components/layout/GlobalBackground';
import { GlowDefs } from '@/components/graphics/GlowDefs';
import { RightSidebar } from '@/components/layout/RightSidebar';

import { Loader2, RefreshCcw } from 'lucide-react';

import { FeedContainer } from '@/components/feeds/FeedContainer';

import { NodeForm } from '@/features/brainstorm/components/NodeForm';
import { LinkPicker } from '@/features/brainstorm/components/LinkPicker';
import ThreadScroller from '@/features/brainstorm/components/ThreadScroller';
import { useBrainstormStore } from '@/features/brainstorm/store';
import { getBrainstormGraph } from '@/features/brainstorm/adapters/supabaseAdapter';

import {
  BrainstormLayout,
  type Spark,
  type PostSummary,
  type OpenIdeaSummary,
} from '@/components/brainstorm/BrainstormLayout';

// Fallback timestamp used when posts are missing created_at metadata
const UNKNOWN_TIMESTAMP = '1970-01-01T00:00:00.000Z';

export default function BrainstormFeed() {
  const { setNodes, setEdges, nodes, clearThread } = useBrainstormStore();
  const [isGraphLoading, setIsGraphLoading] = useState(true);
  const [activeSparkId, setActiveSparkId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<'root' | 'continue'>('root');
  const [composerParentId, setComposerParentId] = useState<string | null>(null);
  const [linkPickerOpen, setLinkPickerOpen] = useState(false);
  const [linkSourceId, setLinkSourceId] = useState<string | null>(null);

  const loadGraph = useCallback(async () => {
    setIsGraphLoading(true);
    try {
      const payload = await getBrainstormGraph();
      setNodes(payload.nodes);
      setEdges(payload.edges);
      await useBrainstormStore.getState().rebuildFeed();
    } catch (error) {
      console.error('Failed to load brainstorm graph:', error);
    } finally {
      setIsGraphLoading(false);
    }
  }, [setEdges, setNodes]);

  const handleSelectSpark = (sparkId: string) => {
    setActiveSparkId(sparkId);
  };

  const handleContinueFromSpark = (sparkId: string) => {
    setComposerMode('continue');
    setComposerParentId(sparkId);
    setComposerOpen(true);
  };

  const handleSaveReferenceFromSpark = (sparkId: string) => {
    setLinkSourceId(sparkId);
    setLinkPickerOpen(true);
  };

  const handleViewSpark = async (sparkId: string) => {
    console.debug('Viewed spark', sparkId);
  };

  const handleGiveThought = async (sparkId: string) => {
    console.debug('Thought on spark', sparkId);
  };

  useEffect(() => {
    const cont = (e: any) => {
      setComposerMode('continue');
      setComposerParentId(e.detail.parentId);
      setComposerOpen(true);
    };

    const link = (e: any) => {
      setLinkSourceId(e.detail.sourceId);
      setLinkPickerOpen(true);
    };

    const reload = () => {
      void loadGraph();
    };

    window.addEventListener('pb:brainstorm:continue', cont);
    window.addEventListener('pb:brainstorm:link', link);
    window.addEventListener('pb:brainstorm:reload', reload);

    return () => {
      window.removeEventListener('pb:brainstorm:continue', cont);
      window.removeEventListener('pb:brainstorm:link', link);
      window.removeEventListener('pb:brainstorm:reload', reload);
    };
  }, [loadGraph]);

  useEffect(() => {
    void loadGraph();
  }, [loadGraph]);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <GlobalBackground />
      <GlowDefs />

      <section className="relative h-screen overflow-hidden p-4 md:p-6">
        <FeedContainer
          mode="public"
          initialKinds={['brainstorm']}
          renderFeed={(items, feed) => {
            const sparks: Spark[] = items
              .map((item: any) => {
                const id = item.id ?? item.post_id ?? item.post?.id;
                if (!id) return null;

                const title =
                  item.title ??
                  item.post?.title ??
                  (item.kind === 'brainstorm' ? item.post?.headline : null);

                const body =
                  item.body ??
                  item.post?.body ??
                  item.summary ??
                  item.post?.summary ??
                  '';

                return {
                  id: String(id),
                  title: title ?? null,
                  body,
                  created_at: item.created_at ?? item.post?.created_at ?? UNKNOWN_TIMESTAMP,
                  author_display_name:
                    item.author_display_name ??
                    item.author_name ??
                    item.post?.author_display_name ??
                    null,
                  author_avatar_url:
                    item.author_avatar_url ?? item.post?.author_avatar_url ?? null,
                  is_anonymous: !!item.is_anonymous,
                  t_score: item.t_score ?? 0,
                  view_count: item.view_count ?? 0,
                  has_given_thought: item.has_given_thought ?? false,
                };
              })
              .filter((s): s is Spark => s !== null);

            const currentSpark =
              sparks.find((s) => s.id === activeSparkId) ?? sparks[0] ?? null;
            const lastSeenSparks = sparks;
            const referencedPosts: PostSummary[] = [];
            const openIdeas: OpenIdeaSummary[] = [];

            return (
              <div className="flex h-full flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
                <div className="flex flex-col">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={feed.refresh}
                      className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm text-slate-200 ring-1 ring-white/10 transition hover:bg-white/10"
                    >
                      <RefreshCcw size={16} /> Refresh feed
                    </button>
                    <button
                      onClick={async () => {
                        clearThread();
                        await loadGraph();
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm text-slate-200 ring-1 ring-white/10 transition hover:bg-white/10"
                    >
                      <RefreshCcw size={16} /> Refresh graph
                    </button>
                  </div>
                  <BrainstormLayout
                    lastSeenSparks={lastSeenSparks}
                    currentSpark={currentSpark}
                    referencedPosts={referencedPosts}
                    openIdeas={openIdeas}
                    onSelectSpark={handleSelectSpark}
                    onGiveThought={handleGiveThought}
                    onContinueBrainstorm={handleContinueFromSpark}
                    onSaveReference={handleSaveReferenceFromSpark}
                    onViewSpark={handleViewSpark}
                  />
                </div>

                <div className="hidden min-h-0 flex-col gap-4 lg:flex">
                  <div className="flex-1 overflow-hidden rounded-3xl border border-white/10 bg-black/10 p-4">
                    {isGraphLoading ? (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : nodes.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        No brainstorms yet
                      </div>
                    ) : (
                      <ThreadScroller />
                    )}
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-black/10">
                    <RightSidebar variant="feed" />
                  </div>
                </div>
              </div>
            );
          }}
        />
      </section>

      <NodeForm
        open={composerOpen}
        onOpenChange={(o) => {
          setComposerOpen(o);
          if (!o) setComposerParentId(null);
        }}
        mode={composerMode}
        parentId={composerParentId}
      />

      <LinkPicker
        open={linkPickerOpen}
        onOpenChange={(o) => {
          setLinkPickerOpen(o);
          if (!o) setLinkSourceId(null);
        }}
        sourceId={linkSourceId}
      />
    </main>
  );
}
