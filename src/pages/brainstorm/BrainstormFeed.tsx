import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GlobalBackground } from '@/components/layout/GlobalBackground';
import { GlowDefs } from '@/components/graphics/GlowDefs';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { FeedContainer, type FeedRenderState } from '@/components/feeds/FeedContainer';
import { Loader2, RefreshCcw } from 'lucide-react';
import { NodeForm } from '@/features/brainstorm/components/NodeForm';
import { LinkPicker } from '@/features/brainstorm/components/LinkPicker';
import { CrossLinksFeed } from '@/features/brainstorm/components/CrossLinksFeed';
import { BrainstormLayoutShell } from '@/features/brainstorm/components/BrainstormLayoutShell';
import type { Post } from '@/types/post';

const UNKNOWN_TIMESTAMP = '1970-01-01T00:00:00.000Z';

interface BrainstormFeedContentProps {
  posts: Post[];
  feedState: FeedRenderState<Post & { kind?: string; [key: string]: unknown }>;
}

function BrainstormFeedContent({ posts, feedState }: BrainstormFeedContentProps) {
  const { loading: postsLoading, error: postsError, refresh: refreshFeed } = feedState;
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [lastSeenIds, setLastSeenIds] = useState<string[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<'root' | 'continue'>('root');
  const [composerParentId, setComposerParentId] = useState<string | null>(null);
  const [linkPickerOpen, setLinkPickerOpen] = useState(false);
  const [linkSourceId, setLinkSourceId] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Auto-select first post when items appear
  useEffect(() => {
    if (!activePostId && posts.length > 0) {
      const firstPost = posts.find((p) => p.type === 'brainstorm');
      if (firstPost) {
        setActivePostId(firstPost.id);
      }
    }
  }, [posts, activePostId]);

  // Track last seen posts
  useEffect(() => {
    if (!activePostId) return;
    setLastSeenIds((prev) => {
      const next = [activePostId, ...prev.filter((id) => id !== activePostId)];
      return next.slice(0, 25);
    });
  }, [activePostId]);

  // Infinite scroll setup
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !postsLoading) {
          // Trigger load more by refreshing (in a real implementation, you'd have a loadMore function)
          // For now, we'll just refresh to get more items
          void refreshFeed();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [postsLoading, refreshFeed]);

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

    const handleRefresh = () => {
      void refreshFeed();
    };

    window.addEventListener('pb:brainstorm:continue', handleContinue as EventListener);
    window.addEventListener('pb:brainstorm:link', handleLink as EventListener);
    window.addEventListener('pb:brainstorm:refresh', handleRefresh);

    return () => {
      window.removeEventListener('pb:brainstorm:continue', handleContinue as EventListener);
      window.removeEventListener('pb:brainstorm:link', handleLink as EventListener);
      window.removeEventListener('pb:brainstorm:refresh', handleRefresh);
    };
  }, [refreshFeed]);

  const brainstormPosts = useMemo(
    () => posts.filter((item) => item.type === 'brainstorm'),
    [posts]
  );

  const lastSeenPosts = useMemo(() => {
    if (!lastSeenIds.length) {
      return brainstormPosts.slice(0, 10);
    }
    const lookup = new Map(brainstormPosts.map((post) => [post.id, post] as const));
    return lastSeenIds
      .map((id) => lookup.get(id))
      .filter((post): post is Post => Boolean(post));
  }, [lastSeenIds, brainstormPosts]);

  const activePost = useMemo(() => {
    return brainstormPosts.find((post) => post.id === activePostId) ?? null;
  }, [brainstormPosts, activePostId]);

  const handleSelectPost = (postId: string) => {
    setActivePostId(postId);
  };

  const handleContinueFromPost = (postId: string) => {
    setComposerMode('continue');
    setComposerParentId(postId);
    setComposerOpen(true);
  };

  const handleLinkFromPost = (postId: string) => {
    setLinkSourceId(postId);
    setLinkPickerOpen(true);
  };

  return (
    <main className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <GlobalBackground />
      <GlowDefs />

      <section className="relative h-screen overflow-hidden p-4 md:p-6">
        <div className="flex h-full flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                void refreshFeed();
              }}
              className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm text-slate-200 ring-1 ring-white/10 transition hover:bg-white/10"
            >
              <RefreshCcw size={16} /> Refresh feed
            </button>
          </div>

          {postsError && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {postsError}
            </div>
          )}

          <BrainstormLayoutShell
            lastSeen={
              <aside className="min-h-0 rounded-3xl border border-white/10 bg-black/20 backdrop-blur">
                <div className="border-b border-white/10 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Last Seen</p>
                </div>
                <div className="flex h-full flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    {postsLoading && !lastSeenPosts.length ? (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : lastSeenPosts.length === 0 ? (
                      <p className="text-sm text-slate-300">No posts yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {lastSeenPosts.map((post) => (
                          <button
                            key={post.id}
                            onClick={() => handleSelectPost(post.id)}
                            className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                              activePostId === post.id
                                ? 'bg-white/10 text-white'
                                : 'bg-white/5 text-slate-200 hover:bg-white/10'
                            }`}
                          >
                            <p className="text-sm font-medium">
                              {post.title ?? 'Untitled'}
                            </p>
                            <p className="text-xs text-slate-300 line-clamp-2">
                              {post.content}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            }
            main={
              <section className="min-h-0 rounded-3xl border border-white/10 bg-black/10 backdrop-blur">
                <div className="border-b border-white/10 px-6 py-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Brainstorm Feed</p>
                </div>
                <div className="flex h-full flex-col">
                  <div className="grid h-full min-h-0 gap-4 overflow-y-auto px-6 py-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    {/* Feed List */}
                    <div className="space-y-4">
                      {postsLoading && brainstormPosts.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-slate-300">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : brainstormPosts.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-300">
                          No brainstorms yet.
                        </div>
                      ) : (
                        <>
                          {brainstormPosts.map((post) => (
                            <article
                              key={post.id}
                              className={`rounded-3xl border px-5 py-4 transition ${
                                activePostId === post.id
                                  ? 'border-white/40 bg-white/10 shadow-lg'
                                  : 'border-white/10 bg-black/20 hover:border-white/30'
                              }`}
                            >
                              <div className="flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                                      {post.created_at
                                        ? new Date(post.created_at).toLocaleString()
                                        : ''}
                                    </p>
                                    <h3 className="text-xl font-semibold text-white">
                                      {post.title ?? 'Untitled'}
                                    </h3>
                                  </div>
                                </div>
                                <p className="text-base text-slate-100">{post.content}</p>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20"
                                    onClick={() => handleContinueFromPost(post.id)}
                                  >
                                    Continue
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                                    onClick={() => handleLinkFromPost(post.id)}
                                  >
                                    Link
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200 hover:bg-white/10"
                                    onClick={() => handleSelectPost(post.id)}
                                  >
                                    Set active
                                  </button>
                                </div>
                              </div>
                            </article>
                          ))}
                          {/* Sentinel for infinite scroll */}
                          <div ref={sentinelRef} style={{ height: '1px' }} />
                          {postsLoading && (
                            <div className="flex items-center justify-center py-4 text-slate-300">
                              <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Cross-links Panel */}
                    <div className="space-y-4">
                      <CrossLinksFeed postId={activePostId} />
                    </div>
                  </div>
                </div>
              </section>
            }
            sidebar={
              <aside className="min-h-0 rounded-3xl border border-white/10 bg-black/20 p-4 backdrop-blur">
                <RightSidebar variant="feed" />
              </aside>
            }
          />
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

export default function BrainstormFeed() {
  return (
    <FeedContainer
      mode="public"
      initialKinds={['Spark', 'Thread', 'Insight']}
      renderFeed={(items, feedState) => (
        <BrainstormFeedContent posts={items as Post[]} feedState={feedState} />
      )}
    />
  );
}
