import { BasePost } from '../types';
import { cn } from '@/lib/utils';
import { ChevronRight, X } from 'lucide-react';

type Props = {
  /** Breadcrumb path showing navigation history */
  breadcrumbPath: BasePost[];
  /** Callback when clicking a breadcrumb item */
  onNavigateToBreadcrumb: (index: number) => void;
  /** Callback to clear breadcrumb and deselect */
  onClear: () => void;
  /** Optional: currently selected post ID */
  selectedId?: string;
  className?: string;
};

/**
 * Navigation HUD component for breadcrumb navigation
 * 
 * Milestone 5: Interaction Skeleton
 * - Displays breadcrumb path when nodes are selected
 * - Allows navigation back through path
 * - Provides clear/reset functionality
 */
export function NavHUD({
  breadcrumbPath,
  onNavigateToBreadcrumb,
  onClear,
  selectedId,
  className,
}: Props) {
  // Don't render if no breadcrumb path
  if (breadcrumbPath.length === 0) {
    return null;
  }

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

  return (
    <div
      className={cn(
        'absolute top-4 left-1/2 -translate-x-1/2 z-30',
        'flex items-center gap-2 px-4 py-2',
        'bg-background/80 backdrop-blur-md',
        'border border-border/50 rounded-full',
        'shadow-lg',
        className
      )}
    >
      {/* Breadcrumb items */}
      <div className="flex items-center gap-1">
        {breadcrumbPath.map((post, index) => {
          const isLast = index === breadcrumbPath.length - 1;
          const isSelected = selectedId === post.id;

          return (
            <div key={post.id} className="flex items-center gap-1">
              <button
                onClick={() => onNavigateToBreadcrumb(index)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm transition-all',
                  'hover:bg-primary/10',
                  isSelected
                    ? 'bg-primary/20 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title={post.title || getPostTypeLabel(post.type)}
              >
                <span className="truncate max-w-[120px]">
                  {post.title || getPostTypeLabel(post.type)}
                </span>
              </button>
              {!isLast && (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Clear button */}
      {breadcrumbPath.length > 0 && (
        <button
          onClick={onClear}
          className={cn(
            'ml-2 p-1 rounded-full',
            'hover:bg-destructive/10',
            'text-muted-foreground hover:text-destructive',
            'transition-colors'
          )}
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

