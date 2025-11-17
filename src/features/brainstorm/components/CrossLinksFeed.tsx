import { FeedContainer } from '@/features/feed/FeedContainer';
import { BrainstormPostCard } from './BrainstormPostCard';
import { useBrainstormExperienceStore } from '../stores/experience';

export function CrossLinksFeed() {
  const activePostId = useBrainstormExperienceStore((state) => state.activePostId);
  const recordPosts = useBrainstormExperienceStore((state) => state.recordPosts);
  const setActivePost = useBrainstormExperienceStore((state) => state.setActivePost);
  const activePost = useBrainstormExperienceStore(
    (state) => (state.activePostId ? state.postsById[state.activePostId] ?? null : null)
  );

  return (
    <FeedContainer
      mode="brainstorm_cross_links"
      activePostId={activePostId}
      onItemsChange={recordPosts}
      renderFeed={(items) => (
        <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
          {!activePostId ? (
            <div className="text-sm text-muted-foreground">
              Select a post from the main feed to see its cross-links.
            </div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {activePost?.title || 'This post'} has no cross-links yet.
            </div>
          ) : (
            items.map((post) => (
              <BrainstormPostCard
                key={post.id}
                post={post}
                variant="compact"
                showActions={false}
                onSelect={setActivePost}
              />
            ))
          )}
        </div>
      )}
    />
  );
}
