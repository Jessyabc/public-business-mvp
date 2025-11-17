import { formatDistanceToNow } from 'date-fns';
import { Link2 } from 'lucide-react';
import { BasePost } from '@/types/post';
import { GlowCard } from '@/components/ui/GlowCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  post: BasePost;
  variant?: 'full' | 'compact';
  isActive?: boolean;
  metaLabel?: string;
  showActions?: boolean;
  onSelect?: (post: BasePost) => void;
  onContinue?: (post: BasePost) => void;
  onLink?: (post: BasePost) => void;
};

const kindLabel = (kind: BasePost['kind']): string => {
  switch (kind) {
    case 'spark':
      return 'Spark';
    case 'open_idea':
      return 'Open Idea';
    case 'business_insight':
    case 'insight':
      return 'Insight';
    default:
      return 'Brainstorm';
  }
};

const defaultContinue = (id: string) => {
  window.dispatchEvent(
    new CustomEvent('pb:brainstorm:continue', { detail: { parentId: id } })
  );
};

const defaultLink = (id: string) => {
  window.dispatchEvent(
    new CustomEvent('pb:brainstorm:link', { detail: { sourceId: id } })
  );
};

export function BrainstormPostCard({
  post,
  variant = 'full',
  isActive = false,
  metaLabel,
  showActions = true,
  onSelect,
  onContinue,
  onLink,
}: Props) {
  const timestamp = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const summary = post.summary ?? '';

  const handleSelect = () => {
    onSelect?.(post);
  };

  const handleContinue = (event: React.MouseEvent) => {
    event.stopPropagation();
    (onContinue ?? defaultContinue)(post.id);
  };

  const handleLink = (event: React.MouseEvent) => {
    event.stopPropagation();
    (onLink ?? defaultLink)(post.id);
  };

  return (
    <GlowCard
      className={cn(
        'cursor-pointer transition-all',
        'p-4 border border-white/5',
        variant === 'compact' ? 'space-y-2' : 'space-y-3',
        isActive && 'ring-2 ring-primary shadow-lg'
      )}
      onClick={handleSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wide text-primary/70">
            {kindLabel(post.kind)}
          </span>
          <h3
            className={cn(
              'font-semibold text-slate-100',
              variant === 'compact' ? 'text-sm' : 'text-base'
            )}
          >
            {post.title || kindLabel(post.kind)}
          </h3>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {metaLabel ?? timestamp}
        </span>
      </div>

      {summary && (
        <p
          className={cn(
            'text-muted-foreground',
            variant === 'compact' ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'
          )}
        >
          {summary}
        </p>
      )}

      {showActions && (
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="xs"
            variant="secondary"
            className="text-xs"
            onClick={handleContinue}
          >
            Continue
          </Button>
          <Button
            size="xs"
            variant="ghost"
            className="text-xs text-white/80 hover:text-white"
            onClick={handleLink}
          >
            <Link2 className="w-3 h-3 mr-1" />
            Link
          </Button>
        </div>
      )}
    </GlowCard>
  );
}
