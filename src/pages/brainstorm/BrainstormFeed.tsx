import { useEffect, useMemo, useState } from 'react';
import { GlobalBackground } from '@/components/layout/GlobalBackground';
import { GlowDefs } from '@/components/graphics/GlowDefs';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { FeedContainer } from '@/features/feed/FeedContainer';
import { Loader2, RefreshCcw } from 'lucide-react';
import { NodeForm } from '@/features/brainstorm/components/NodeForm';
import { LinkPicker } from '@/features/brainstorm/components/LinkPicker';
import { BrainstormFeedRenderer } from '@/features/brainstorm/components/BrainstormFeedRenderer';
import { BrainstormLayoutShell } from '@/features/brainstorm/components/BrainstormLayoutShell';
import type { Post } from '@/types/post';
import type { useUniversalFeed } from '@/features/feed/hooks/useUniversalFeed';

const UNKNOWN_TIMESTAMP = '1970-01-01T00:00:00.000Z';

interface BrainstormFeedContentProps {
  posts: Post[];
  feed: ReturnType<typeof useUniversalFeed>;
}

function BrainstormFeedContent({ posts, feed }: BrainstormFeedContentProps) {
  const { loading: postsLoading, refresh: refreshFeed, loadMore } = feed;
  const postsError = null; // feed doesn't expose error directly
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [lastSeenIds, setLastSeenIds] = useState<string[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<'root' | 'continue'>('root');
  const [composerParentId, setComposerParentId] = useState<string | null>(null);
  const [linkPickerOpen, setLinkPickerOpen] = useState(false);
  const [linkSourceId, setLinkSourceId] = useState<string | null>(null);

  // Track last seen posts
  useEffect(() => {
    if (!activePostId) return;
    setLastSeenIds((prev) => {
      const next = [activePostId, ...prev.filter((id) => id !== activePostId)];
      return next.slice(0, 25);
    });
  }, [activePostId]);

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
                <div className="flex h-full flex-col p-6">
                  <BrainstormFeedRenderer
                    items={brainstormPosts}
                    loading={postsLoading}
                    onRefresh={refreshFeed}
                    onLoadMore={loadMore}
                  />
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
      mode="brainstorm_main"
      renderFeed={(items, feed) => (
        <BrainstormFeedContent posts={items as Post[]} feed={feed} />
      )}
    />
  );
}
