import { useEffect } from 'react';
import { BasePost } from '@/types/post';
import { BrainstormCanvasShell } from '../BrainstormCanvasShell';
import { BrainstormPostCard } from './BrainstormPostCard';
import { useBrainstormExperienceStore } from '../stores/experience';
import { useBrainstormGraph } from '../hooks/useBrainstormGraph';
import { convertFeedPostToUniversal } from '../utils/postConverter';

type Props = {
  items: BasePost[];
  loading: boolean;
  onRefresh: () => void;
};

/**
 * BrainstormFeedRenderer renders the center column: the canonical feed list and
 * the Brainstorm canvas that stays in sync with the active post selection.
 */
export function BrainstormFeedRenderer({ items, loading, onRefresh }: Props) {
  const recordPosts = useBrainstormExperienceStore((state) => state.recordPosts);
  const activePostId = useBrainstormExperienceStore((state) => state.activePostId);
  const setActivePost = useBrainstormExperienceStore((state) => state.setActivePost);
  const breadcrumbs = useBrainstormExperienceStore((state) => state.breadcrumbs);
  const navigateBreadcrumb = useBrainstormExperienceStore((state) => state.navigateBreadcrumb);
  const clearBreadcrumbs = useBrainstormExperienceStore((state) => state.clearBreadcrumbs);

  useEffect(() => {
    recordPosts(items);
  }, [items, recordPosts]);

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

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="w-full max-w-md flex-shrink-0 overflow-y-auto pr-2">
          <div className="space-y-3">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No public posts yet. Be the first to start a brainstorm.
              </p>
            ) : (
              items.map((post) => (
                <BrainstormPostCard
                  key={post.id}
                  post={post}
                  isActive={post.id === activePostId}
                  onSelect={setActivePost}
                />
              ))
            )}
            {loading && (
              <p className="text-xs text-muted-foreground text-center">Loading…</p>
            )}
          </div>
        </div>

        <div className="flex-1 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-3">
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
      </div>
    </div>
  );
}
