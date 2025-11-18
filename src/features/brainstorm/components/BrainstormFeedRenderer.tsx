import { useEffect, useRef } from 'react';
import { BasePost } from '@/types/post';
import { BrainstormCanvasShell } from '../BrainstormCanvasShell';
import { BrainstormPostCard } from './BrainstormPostCard';
import { CrossLinksFeed } from './CrossLinksFeed';
import { useBrainstormExperienceStore } from '../stores/experience';
import { useBrainstormGraph } from '../hooks/useBrainstormGraph';
import { convertFeedPostToUniversal } from '../utils/postConverter';
import { Loader2 } from 'lucide-react';

type Props = {
  items: BasePost[];
  loading: boolean;
  onRefresh: () => void;
  onLoadMore?: () => void;
};

/**
 * BrainstormFeedRenderer renders the center column: the canonical feed list,
 * the Brainstorm canvas, and cross-links panel that stay in sync with the active post selection.
 * On desktop: feed + canvas + cross-links are visible side-by-side.
 * On mobile: these stack vertically inside the main-tab content.
 */
export function BrainstormFeedRenderer({ items, loading, onRefresh, onLoadMore }: Props) {
  const recordPosts = useBrainstormExperienceStore((state) => state.recordPosts);
  const activePostId = useBrainstormExperienceStore((state) => state.activePostId);
  const setActivePost = useBrainstormExperienceStore((state) => state.setActivePost);
  const breadcrumbs = useBrainstormExperienceStore((state) => state.breadcrumbs);
  const navigateBreadcrumb = useBrainstormExperienceStore((state) => state.navigateBreadcrumb);
  const clearBreadcrumbs = useBrainstormExperienceStore((state) => state.clearBreadcrumbs);

  useEffect(() => {
    recordPosts(items);
  }, [items, recordPosts]);

  const sentinelRefDesktop = useRef<HTMLDivElement>(null);
  const sentinelRefMobile = useRef<HTMLDivElement>(null);

  // Auto-select first post if no active post is selected
  useEffect(() => {
    if (!activePostId && items.length > 0) {
      setActivePost(items[0]);
    }
  }, [items, activePostId, setActivePost]);

  // Infinite scroll setup for desktop
  useEffect(() => {
    if (!sentinelRefDesktop.current || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && onLoadMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRefDesktop.current);

    return () => {
      observer.disconnect();
    };
  }, [loading, onLoadMore]);

  // Infinite scroll setup for mobile
  useEffect(() => {
    if (!sentinelRefMobile.current || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && onLoadMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRefMobile.current);

    return () => {
      observer.disconnect();
    };
  }, [loading, onLoadMore]);

  const { nodes, links, loading: graphLoading } = useBrainstormGraph(activePostId);

  const convertedBreadcrumbs = breadcrumbs.map(convertFeedPostToUniversal);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary/70">Brainstorm Feed</p>
          <p className="text-lg font-semibold text-white">Public Sparks & Threads</p>
        </div>
        <button
          onClick={onRefresh}
          className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/80 hover:bg-white/10"
        >
          Refresh
        </button>
      </div>

      {/* Desktop: feed + canvas + cross-links side-by-side */}
      <div className="hidden lg:grid lg:flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-4 lg:overflow-hidden">
        {/* Feed List */}
        <div className="overflow-y-auto pr-2">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No public posts yet. Be the first to start a brainstorm.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((post) => (
                <BrainstormPostCard
                  key={post.id}
                  post={post}
                  isActive={post.id === activePostId}
                  onSelect={setActivePost}
                />
              ))}
              {/* Sentinel for infinite scroll */}
              {onLoadMore && <div ref={sentinelRefDesktop} style={{ height: '1px' }} />}
              {loading && (
                <div className="flex items-center justify-center py-4 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-3">
          {activePostId ? (
            <BrainstormCanvasShell
              posts={nodes}
              links={links}
              selectedId={activePostId}
              breadcrumbPath={convertedBreadcrumbs}
              onSelect={setActivePost}
              onNavigateBreadcrumb={navigateBreadcrumb}
              onClearBreadcrumbs={clearBreadcrumbs}
              className="h-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p>Select a post from the feed to load the canvas.</p>
            </div>
          )}
          {graphLoading && (
            <p className="mt-2 text-center text-xs text-muted-foreground">Building canvas…</p>
          )}
        </div>

        {/* Cross-links Panel */}
        <div className="overflow-y-auto">
          <CrossLinksFeed postId={activePostId} />
        </div>
      </div>

      {/* Mobile: feed + canvas + cross-links stack vertically */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto lg:hidden">
        {/* Feed List */}
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No public posts yet. Be the first to start a brainstorm.
            </p>
          ) : (
            <>
              {items.map((post) => (
                <BrainstormPostCard
                  key={post.id}
                  post={post}
                  isActive={post.id === activePostId}
                  onSelect={setActivePost}
                />
              ))}
              {/* Sentinel for infinite scroll */}
              {onLoadMore && <div ref={sentinelRefMobile} style={{ height: '1px' }} />}
              {loading && (
                <div className="flex items-center justify-center py-4 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Canvas */}
        <div className="min-h-[400px] rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-3">
          {activePostId ? (
            <BrainstormCanvasShell
              posts={nodes}
              links={links}
              selectedId={activePostId}
              breadcrumbPath={convertedBreadcrumbs}
              onSelect={setActivePost}
              onNavigateBreadcrumb={navigateBreadcrumb}
              onClearBreadcrumbs={clearBreadcrumbs}
              className="h-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p>Select a post from the feed to load the canvas.</p>
            </div>
          )}
          {graphLoading && (
            <p className="mt-2 text-center text-xs text-muted-foreground">Building canvas…</p>
          )}
        </div>

        {/* Cross-links Panel */}
        <div>
          <CrossLinksFeed postId={activePostId} />
        </div>
      </div>
    </div>
  );
}
