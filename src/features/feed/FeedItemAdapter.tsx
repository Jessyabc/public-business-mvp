import React from 'react';
import { BasePost, isBrainstorm, isInsight, isOpenIdea } from '@/types/post';
import { IdeaCard } from '@/components/IdeaCard';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link2 } from 'lucide-react';
import { GlassCard } from '@/ui/components/GlassCard';

export function FeedItemAdapter({ post }: { post: BasePost }) {
  if (isOpenIdea(post)) {
    // Map BasePost to OpenIdea format for IdeaCard
    return (
      <div data-testid={`oi-${post.id}`}>
        <IdeaCard
          idea={{
            id: post.id,
            content: post.summary || '',
            linked_brainstorms_count: 0, // TODO: fetch from feedQueries if available
            created_at: post.created_at,
            updated_at: post.updated_at,
          }}
        />
      </div>
    );
  }

  if (isBrainstorm(post)) {
    // Map BasePost to Brainstorm format for BrainstormCard
    // Add Continue and Link buttons that dispatch custom events
    const handleContinue = (e: React.MouseEvent) => {
      e.stopPropagation();
      window.dispatchEvent(
        new CustomEvent('pb:brainstorm:continue', {
          detail: { parentId: post.id },
        })
      );
    };

    const handleLink = (e: React.MouseEvent) => {
      e.stopPropagation();
      window.dispatchEvent(
        new CustomEvent('pb:brainstorm:link', {
          detail: { sourceId: post.id },
        })
      );
    };

    return (
      <div data-testid={`bs-${post.id}`}>
        <Card className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {post.title || 'Untitled Brainstorm'}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                </div>
              </div>
              <Badge variant={post.privacy === 'public' ? 'default' : 'secondary'}>
                {post.privacy === 'public' ? 'Public' : 'Private'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              {post.summary || ''}
            </p>
            {post.metrics && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                {post.metrics.t_score !== null && post.metrics.t_score !== undefined && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">T:</span>
                    <span>{post.metrics.t_score}</span>
                  </div>
                )}
                {post.metrics.involvement !== null && post.metrics.involvement !== undefined && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Involvement:</span>
                    <span>{post.metrics.involvement}</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleContinue}
                className="flex-1"
              >
                Continue
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLink}
                className="flex-1"
              >
                <Link2 className="w-4 h-4 mr-1" />
                Link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isInsight(post)) {
    // Render a simplified Business Insight card
    return (
      <div data-testid={`bi-${post.id}`}>
        <GlassCard className="glass-card interactive-glass" padding="md">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <Badge variant="secondary" className="text-xs">
                Business Insight
              </Badge>
              <Badge variant={post.privacy === 'public' ? 'default' : 'secondary'}>
                {post.privacy === 'public' ? 'Public' : 'Private'}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg leading-tight">
              {post.title || 'Untitled Insight'}
            </h3>
            {post.summary && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {post.summary}
              </p>
            )}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                {post.metrics?.u_score !== null && post.metrics?.u_score !== undefined && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">U-Score:</span>
                    <span>{post.metrics.u_score}</span>
                  </div>
                )}
                {post.metrics?.t_score !== null && post.metrics?.t_score !== undefined && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">T-Score:</span>
                    <span>{post.metrics.t_score}</span>
                  </div>
                )}
              </div>
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Fallback for unknown kinds
  return (
    <div className="p-4 border border-border rounded-lg">
      <p className="text-sm text-muted-foreground">Unknown post type: {post.kind}</p>
    </div>
  );
}

