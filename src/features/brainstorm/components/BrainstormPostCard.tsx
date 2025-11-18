import { BasePost } from '@/types/post';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Link2 } from 'lucide-react';

type Props = {
  post: BasePost;
  variant?: 'default' | 'compact';
  showActions?: boolean;
  metaLabel?: string;
  onSelect?: (post: BasePost) => void;
};

export function BrainstormPostCard({ 
  post, 
  variant = 'default',
  showActions = true,
  metaLabel,
  onSelect 
}: Props) {
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
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => onSelect?.(post)}
    >
      <CardHeader className={variant === 'compact' ? 'pb-2' : 'pb-3'}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold truncate ${variant === 'compact' ? 'text-base' : 'text-lg'}`}>
              {post.title || 'Untitled Post'}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              {metaLabel && (
                <>
                  <span>•</span>
                  <span>{metaLabel}</span>
                </>
              )}
            </div>
          </div>
          <Badge variant={post.visibility === 'public' ? 'default' : 'secondary'}>
            {post.visibility}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
          {post.content}
        </p>
        
        {(post.likes_count > 0 || post.views_count > 0 || post.t_score) && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            {post.t_score && (
              <div className="flex items-center gap-1">
                <span className="font-semibold">T:</span>
                <span>{post.t_score}</span>
              </div>
            )}
            {post.likes_count > 0 && (
              <div className="flex items-center gap-1">
                <span className="font-semibold">Likes:</span>
                <span>{post.likes_count}</span>
              </div>
            )}
            {post.views_count > 0 && (
              <div className="flex items-center gap-1">
                <span className="font-semibold">Views:</span>
                <span>{post.views_count}</span>
              </div>
            )}
          </div>
        )}

        {showActions && (
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
        )}
      </CardContent>
    </Card>
  );
}
