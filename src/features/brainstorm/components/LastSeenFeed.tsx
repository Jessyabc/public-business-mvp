import { formatDistanceToNow } from 'date-fns';
import { FeedContainer } from '@/features/feed/FeedContainer';
import { BrainstormPostCard } from './BrainstormPostCard';
import { useBrainstormExperienceStore } from '../stores/experience';
import { BasePost } from '@/types/post';

type HistoryItem = BasePost & { viewedAt?: string };

export function LastSeenFeed() {
  const setActivePost = useBrainstormExperienceStore((state) => state.setActivePost);

  return (
    <FeedContainer
      mode="brainstorm_last_seen"
      renderFeed={(items) => (
        <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No recently viewed posts. Explore the main feed to start a thread.
            </div>
          ) : (
            items.map((item) => {
              const history = item as HistoryItem;
              const metaLabel = history.viewedAt
                ? `Viewed ${formatDistanceToNow(new Date(history.viewedAt), { addSuffix: true })}`
                : undefined;

              return (
                <BrainstormPostCard
                  key={item.id}
                  post={item}
                  variant="compact"
                  showActions={false}
                  metaLabel={metaLabel}
                  onSelect={setActivePost}
                />
              );
            })
          )}
        </div>
      )}
    />
  );
}
