import { useMemo } from 'react';
import { BasePost as FeedBasePost } from '@/types/post';
import { BrainstormCanvasShell } from '../BrainstormCanvasShell';
import { convertFeedPostToUniversal } from '../utils/postConverter';
import { usePostLinks } from '../hooks/usePostLinks';

type Props = {
  items: FeedBasePost[];
  loading: boolean;
};

/**
 * Component that renders the brainstorm canvas with links
 * Separated to allow proper hook usage
 */
export function BrainstormFeedRenderer({ items, loading }: Props) {
  // Convert feed posts to Universal Post Model format
  const universalPosts = useMemo(
    () => items.map(convertFeedPostToUniversal),
    [items]
  );

  // Extract post IDs for fetching links
  const postIds = useMemo(
    () => universalPosts.map(p => p.id),
    [universalPosts]
  );

  // Fetch links for these posts
  const links = usePostLinks(postIds);

  return (
    <div className="h-full">
      <BrainstormCanvasShell 
        posts={universalPosts} 
        links={links}
        className="h-full" 
      />
      {loading && (
        <div className="text-center py-4 text-muted-foreground">
          Loading more posts...
        </div>
      )}
    </div>
  );
}

