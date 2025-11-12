import { BasePost as FeedBasePost } from '@/types/post';
import { BasePost as UniversalBasePost, PostType, PostMode, BaseMetrics } from '../types';

/**
 * Converts a feed BasePost (from @/types/post) to Universal Post Model BasePost
 */
export function convertFeedPostToUniversal(feedPost: FeedBasePost): UniversalBasePost {
  // Map kind to type
  const typeMap: Record<FeedBasePost['kind'], PostType> = {
    'open_idea': 'spark',
    'brainstorm': 'brainstorm',
    'business_insight': 'insight',
  };

  // Determine mode based on kind
  const mode: PostMode = feedPost.kind === 'business_insight' ? 'business' : 'public';

  // Convert metrics
  const metrics: BaseMetrics = {
    views: 0,
    saves: 0,
    shares: 0,
    t_score: feedPost.metrics?.t_score ?? 0,
    involvement: feedPost.metrics?.involvement ?? 0,
    utility: feedPost.metrics?.u_score ?? undefined,
  };

  // Convert privacy: 'org' maps to 'private' since org-level posts are not publicly visible
  const privacy: 'public' | 'private' = 
    feedPost.privacy === 'private' || feedPost.privacy === 'org' 
      ? 'private' 
      : 'public';

  return {
    id: feedPost.id,
    author_id: feedPost.author_id,
    org_id: feedPost.org_id ?? null,
    type: typeMap[feedPost.kind],
    title: feedPost.title ?? null,
    content: feedPost.summary ?? null,
    created_at: feedPost.created_at,
    updated_at: feedPost.updated_at,
    linked_post_ids: [],
    privacy,
    mode,
    metrics,
  };
}


