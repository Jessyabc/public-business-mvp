import { useCallback, useEffect, useMemo, useState } from 'react';

import { GlobalBackground } from '@/components/layout/GlobalBackground';
import { GlowDefs } from '@/components/graphics/GlowDefs';
import { RightSidebar } from '@/components/layout/RightSidebar';

import { Loader2, RefreshCcw } from 'lucide-react';

import { NodeForm } from '@/features/brainstorm/components/NodeForm';
import { LinkPicker } from '@/features/brainstorm/components/LinkPicker';
import { useBrainstormStore } from '@/features/brainstorm/store';
import { getBrainstormGraph } from '@/features/brainstorm/adapters/supabaseAdapter';
import { usePosts } from '@/hooks/usePosts';

interface Spark {
  id: string;
  title: string | null;
  body: string;
  created_at: string;
  author_display_name: string | null;
  author_avatar_url: string | null;
  is_anonymous: boolean;
  t_score: number;
  view_count: number;
  has_given_thought: boolean;
}

interface CrossLinkEntry {
  id: string;
  title: string;
  excerpt: string;
  relation: 'hard' | 'soft';
  created_at?: string;
  author?: string | null;
  likes_count?: number;
  views_count?: number;
}

const UNKNOWN_TIMESTAMP = '1970-01-01T00:00:00.000Z';

export default function BrainstormFeed() {
  const { posts, loading: postsLoading, error: postsError, fetchPosts } = usePosts();
  const { setNodes, setEdges, nodes, clearThread } = useBrainstormStore((state) => ({
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    nodes: state.nodes,
    clearThread: state.clearThread,
  }));
  const hardNeighborsFor = useBrainstormStore((state) => state.hardNeighborsFor);
  const softLinksForPost = useBrainstormStore((state) => state.softLinksForPost);

  const [isGraphLoading, setIsGraphLoading] = useState(true);
  const [activeSparkId, setActiveSparkId] = useState<string | null>(null);
  const [lastSeenIds, setLastSeenIds] = useState<string[]>([]);
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

  useEffect(() => {
    void fetchPosts('public');
  }, [fetchPosts]);

  useEffect(() => {
    const handleContinue = (event: Event) => {
      const detail = (event as CustomEvent<{ parentId?: string }>).detail;
      if (!detail?.parentId) return;
      setComposerMode('continue');
      setComposerParentId(detail.parentId);
      setComposerOpen(true);
    };

    const handleLink = (event: Event) => {
      const detail = (event as CustomEvent<{ sourceId?: string }>).detail;
      if (!detail?.sourceId) return;
      setLinkSourceId(detail.sourceId);
      setLinkPickerOpen(true);
    };

    const reload = () => {
      void loadGraph();
    };

    window.addEventListener('pb:brainstorm:continue', handleContinue as EventListener);
    window.addEventListener('pb:brainstorm:link', handleLink as EventListener);
    window.addEventListener('pb:brainstorm:reload', reload);

    return () => {
      window.removeEventListener('pb:brainstorm:continue', handleContinue as EventListener);
      window.removeEventListener('pb:brainstorm:link', handleLink as EventListener);
      window.removeEventListener('pb:brainstorm:reload', reload);
    };
  }, [loadGraph]);

  useEffect(() => {
    void loadGraph();
  }, [loadGraph]);

  const sparks = useMemo(() => {
    return posts
      .filter((item) => item.type === 'brainstorm')
      .map((item) => {
        const body = item.body ?? item.content ?? '';
        return {
          id: String(item.id),
          title: item.title ?? null,
          body,
          created_at: item.created_at ?? UNKNOWN_TIMESTAMP,
          author_display_name: null,
          author_avatar_url: null,
          is_anonymous: false,
          t_score: item.t_score ?? 0,
          view_count: item.views_count ?? 0,
          has_given_thought: false,
        } satisfies Spark;
      })
      .filter((spark) => spark.body.trim().length > 0 || spark.title);
  }, [posts]);

  useEffect(() => {
    if (!sparks.length) {
      setActiveSparkId(null);
      return;
    }

    setActiveSparkId((prev) => {
      if (prev && sparks.some((spark) => spark.id === prev)) {
        return prev;
      }
      return sparks[0]?.id ?? null;
    });
  }, [sparks]);

  useEffect(() => {
    if (!activeSparkId) return;
    setLastSeenIds((prev) => {
      const next = [activeSparkId, ...prev.filter((id) => id !== activeSparkId)];
      return next.slice(0, 25);
    });
  }, [activeSparkId]);

  const activeSpark = useMemo(() => {
    return sparks.find((spark) => spark.id === activeSparkId) ?? null;
  }, [sparks, activeSparkId]);

  const lastSeenSparks = useMemo(() => {
    if (!lastSeenIds.length) {
      return sparks;
    }
    const lookup = new Map(sparks.map((spark) => [spark.id, spark] as const));
    return lastSeenIds
      .map((id) => lookup.get(id))
      .filter((spark): spark is Spark => Boolean(spark));
  }, [lastSeenIds, sparks]);

  const crossLinks = useMemo(() => {
    if (!activeSparkId) return [] as CrossLinkEntry[];

    const map = new Map<string, CrossLinkEntry>();

    hardNeighborsFor(activeSparkId).forEach((node) => {
      map.set(node.id, {
        id: node.id,
        title: node.title || 'Untitled spark',
        excerpt: node.content || '',
        relation: 'hard',
        created_at: node.created_at,
        author: node.author,
        likes_count: node.likes_count,
        views_count: node.views_count,
      });
    });

    softLinksForPost(activeSparkId).forEach((link) => {
      if (map.has(link.id)) {
        return;
      }
      const relatedNode = nodes.find((node) => node.id === link.id);
      map.set(link.id, {
        id: link.id,
        title: link.title ?? relatedNode?.title ?? 'Untitled spark',
        excerpt: relatedNode?.content ?? '',
        relation: 'soft',
        created_at: relatedNode?.created_at,
        author: relatedNode?.author,
        likes_count: link.like_count ?? relatedNode?.likes_count,
        views_count: relatedNode?.views_count,
      });
    });

    return Array.from(map.values());
  }, [activeSparkId, hardNeighborsFor, softLinksForPost, nodes]);

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

  return (
    <main className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <GlobalBackground />
      <GlowDefs />

      <section className="relative h-screen overflow-hidden p-4 md:p-6">
        <div className="flex h-full flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchPosts('public')}
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

          {postsError && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {postsError}
            </div>
          )}

          <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(220px,260px)_minmax(0,1fr)_minmax(220px,260px)]">
            <aside className="min-h-0 rounded-3xl border border-white/10 bg-black/20 backdrop-blur">
              <div className="border-b border-white/10 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Last Seen</p>
              </div>
              <div className="flex h-full flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {postsLoading && !lastSeenSparks.length ? (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : lastSeenSparks.length === 0 ? (
                    <p className="text-sm text-slate-300">No sparks yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {lastSeenSparks.map((spark) => (
                        <button
                          key={spark.id}
                          onClick={() => handleSelectSpark(spark.id)}
                          className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                            activeSparkId === spark.id
                              ? 'bg-white/10 text-white'
                              : 'bg-white/5 text-slate-200 hover:bg-white/10'
                          }`}
                        >
                          <p className="text-sm font-medium">
                            {spark.title ?? 'Untitled spark'}
                          </p>
                          <p className="text-xs text-slate-300 line-clamp-2">
                            {spark.body}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            <section className="min-h-0 rounded-3xl border border-white/10 bg-black/10 backdrop-blur">
              <div className="border-b border-white/10 px-6 py-4">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Brainstorm Feed</p>
              </div>
              <div className="flex h-full flex-col">
                <div className="grid h-full min-h-0 gap-4 overflow-y-auto px-6 py-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                  <div className="space-y-4">
                    {postsLoading && sparks.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : sparks.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-300">
                        No brainstorms yet.
                      </div>
                    ) : (
                      sparks.map((spark) => (
                        <article
                          key={spark.id}
                          className={`rounded-3xl border px-5 py-4 transition ${
                            activeSparkId === spark.id
                              ? 'border-white/40 bg-white/10 shadow-lg'
                              : 'border-white/10 bg-black/20 hover:border-white/30'
                          }`}
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                                  {spark.created_at ? new Date(spark.created_at).toLocaleString() : ''}
                                </p>
                                <h3 className="text-xl font-semibold text-white">
                                  {spark.title ?? 'Untitled spark'}
                                </h3>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleViewSpark(spark.id)}
                                className="text-xs uppercase tracking-[0.3em] text-primary"
                              >
                                View
                              </button>
                            </div>
                            <p className="text-base text-slate-100">
                              {spark.body}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                                onClick={() => handleGiveThought(spark.id)}
                              >
                                {spark.has_given_thought ? 'Thank you!' : 'Give a thought'}
                              </button>
                              <button
                                type="button"
                                className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20"
                                onClick={() => handleContinueFromSpark(spark.id)}
                              >
                                Continue
                              </button>
                              <button
                                type="button"
                                className="rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                                onClick={() => handleSaveReferenceFromSpark(spark.id)}
                              >
                                Link
                              </button>
                              <button
                                type="button"
                                className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200 hover:bg-white/10"
                                onClick={() => handleSelectSpark(spark.id)}
                              >
                                Set active
                              </button>
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Cross-links</p>
                      {isGraphLoading ? (
                        <div className="mt-6 flex items-center justify-center text-slate-300">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      ) : !activeSpark ? (
                        <p className="mt-4 text-sm text-slate-300">
                          Load a spark to see its cross-links.
                        </p>
                      ) : crossLinks.length === 0 ? (
                        <p className="mt-4 text-sm text-slate-300">No cross-links yet.</p>
                      ) : (
                        <ul className="mt-4 space-y-3">
                          {crossLinks.map((link) => (
                            <li key={link.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                                <span>{link.relation === 'hard' ? 'Hard link' : 'Soft link'}</span>
                                {link.created_at && <span>{new Date(link.created_at).toLocaleDateString()}</span>}
                              </div>
                              <p className="mt-2 text-base font-semibold text-white">{link.title}</p>
                              {link.excerpt && (
                                <p className="text-sm text-slate-300 line-clamp-3">{link.excerpt}</p>
                              )}
                              {link.author && (
                                <p className="mt-2 text-xs text-slate-400">{link.author}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <aside className="min-h-0 rounded-3xl border border-white/10 bg-black/20 p-4 backdrop-blur">
              <RightSidebar variant="feed" />
            </aside>
          </div>
        </div>
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
