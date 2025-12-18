/**
 * Pillar #1: Anchored Thought State
 * 
 * Paper-like neumorphism for grounded, externalized thoughts.
 * Subtle depth, tactile warmth - not trendy, just safe storage.
 * Click to re-enter Active Thinking.
 */

import { useCallback } from 'react';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnchoredThoughtProps {
  thoughtId: string;
}

export function AnchoredThought({ thoughtId }: AnchoredThoughtProps) {
  const { thoughts, reactivateThought, deleteThought } = useWorkspaceStore();
  
  const thought = thoughts.find((t) => t.id === thoughtId);
  
  const handleClick = useCallback(() => {
    reactivateThought(thoughtId);
  }, [thoughtId, reactivateThought]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteThought(thoughtId);
  }, [thoughtId, deleteThought]);

  if (!thought) return null;

  // Format relative time
  const updatedAt = new Date(thought.updated_at);
  const now = new Date();
  const diffMs = now.getTime() - updatedAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  let timeAgo = 'just now';
  if (diffDays > 0) timeAgo = `${diffDays}d ago`;
  else if (diffHours > 0) timeAgo = `${diffHours}h ago`;
  else if (diffMins > 0) timeAgo = `${diffMins}m ago`;

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={cn(
        "anchored-thought group",
        "relative w-full cursor-pointer",
        "transition-all duration-300 ease-out",
        "hover:translate-y-[-2px]"
      )}
    >
      {/* Paper-neumorphic card */}
      <div className={cn(
        "relative rounded-xl p-5",
        "bg-[var(--workspace-anchored-bg)]",
        "shadow-[var(--workspace-anchored-shadow)]",
        "border border-[var(--workspace-anchored-border)]",
        "transition-all duration-300",
        "group-hover:shadow-[var(--workspace-anchored-shadow-hover)]"
      )}>
        {/* Content */}
        <p className={cn(
          "text-[var(--workspace-anchored-text)]",
          "text-base leading-relaxed",
          "whitespace-pre-wrap break-words",
          "line-clamp-6"
        )}>
          {thought.content}
        </p>
        
        {/* Footer: time + delete */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--workspace-anchored-border)]">
          <span className="text-xs text-[var(--workspace-anchored-muted)]">
            {timeAgo}
          </span>
          
          <button
            onClick={handleDelete}
            className={cn(
              "p-1.5 rounded-lg",
              "text-[var(--workspace-anchored-muted)]",
              "opacity-0 group-hover:opacity-100",
              "hover:text-red-500 hover:bg-red-500/10",
              "transition-all duration-200"
            )}
            aria-label="Delete thought"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
