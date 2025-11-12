import React from 'react';
import { BasePost } from '../types';
import { GlassCard } from '@/ui/components/GlassCard';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Props = {
  posts: BasePost[];
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  selectedId?: string;
  hoveredId?: string;
};

export function NodesLayer({ posts, onSelect, onHover, selectedId, hoveredId }: Props) {
  const getPostTypeLabel = (type: BasePost['type']): string => {
    const labels: Record<BasePost['type'], string> = {
      spark: 'Spark',
      brainstorm: 'Brainstorm',
      branch: 'Branch',
      insight: 'Insight',
      department_update: 'Dept Update',
      business_report: 'Report',
    };
    return labels[type] || type;
  };

  const getRingClasses = (post: BasePost): string => {
    const baseRing = 'ring-neutral-200';
    let ringWidth = '';
    
    // If involvement > 5, use ring-2 (highest priority)
    if (post.metrics.involvement > 5) {
      ringWidth = 'ring-2';
    } else if (post.metrics.t_score > 5) {
      // Otherwise, if t_score > 5, use ring-1
      ringWidth = 'ring-1';
    }
    
    return cn(baseRing, ringWidth);
  };

  return (
    <div className="flex flex-row gap-6 p-6 overflow-x-auto">
      {posts.map((post) => {
        const isSelected = selectedId === post.id;
        const isHovered = hoveredId === post.id;
        
        return (
          <div
            key={post.id}
            onMouseEnter={() => onHover(post.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(post.id)}
            className="flex-shrink-0"
          >
            <GlassCard
              className={cn(
                'min-w-[280px] max-w-[320px]',
                getRingClasses(post),
                isSelected && 'ring-2 ring-primary',
                isHovered && 'ring-2 ring-primary/50',
                'transition-all duration-200'
              )}
              interactive
              padding="md"
            >
              <div className="space-y-3">
                {/* Type badge */}
                <Badge variant="secondary" className="text-xs">
                  {getPostTypeLabel(post.type)}
                </Badge>
                
                {/* Title or fallback */}
                <h3 className="font-semibold text-lg leading-tight">
                  {post.title || getPostTypeLabel(post.type)}
                </h3>
                
                {/* Optional content preview */}
                {post.content && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.content}
                  </p>
                )}
              </div>
            </GlassCard>
          </div>
        );
      })}
    </div>
  );
}

