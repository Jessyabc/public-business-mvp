import React from 'react';
import { BasePost, isBrainstorm, isInsight, isOpenIdea } from '@/types/post';

export function FeedItemAdapter({ post }: { post: BasePost }) {
  if (isOpenIdea(post))   return <div data-testid={`oi-${post.id}`} />;
  if (isBrainstorm(post)) return <div data-testid={`bs-${post.id}`} />;
  if (isInsight(post))    return <div data-testid={`bi-${post.id}`} />;
  return <div />;
}

