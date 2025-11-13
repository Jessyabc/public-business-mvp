import { useRef, useEffect, useCallback } from 'react';
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
  onAnchorUpdate?: (getAnchor: (id: string) => { x: number; y: number } | null) => void;
};

export function NodesLayer({ posts, onSelect, onHover, selectedId, hoveredId, onAnchorUpdate }: Props) {
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const getNodeAnchor = useCallback((id: string): { x: number; y: number } | null => {
    const nodeElement = nodeRefs.current.get(id);
    if (!nodeElement) return null;

    const rect = nodeElement.getBoundingClientRect();
    const containerRect = nodeElement.parentElement?.getBoundingClientRect();
    if (!containerRect) return null;

    // Calculate center-bottom of the card relative to container
    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top + rect.height;

    return { x, y };
  }, []);

  // Update anchor callback when it changes
  useEffect(() => {
    if (onAnchorUpdate) {
      onAnchorUpdate(getNodeAnchor);
    }
  }, [getNodeAnchor, onAnchorUpdate]);

  // Recalculate anchors when posts change or on window resize
  useEffect(() => {
    const handleResize = () => {
      if (onAnchorUpdate) {
        // Small delay to ensure DOM has updated
        setTimeout(() => {
          onAnchorUpdate(getNodeAnchor);
        }, 0);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial calculation

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [posts, getNodeAnchor, onAnchorUpdate]);
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

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No posts to display</p>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex flex-row gap-6 p-6 overflow-x-auto h-full">
      {posts.map((post) => {
        const isSelected = selectedId === post.id;
        const isHovered = hoveredId === post.id;
        
        return (
          <div
            key={post.id}
            ref={(el) => {
              if (el) {
                nodeRefs.current.set(post.id, el);
              } else {
                nodeRefs.current.delete(post.id);
              }
            }}
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

