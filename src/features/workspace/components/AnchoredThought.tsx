/**
 * Pillar #1: Anchored Thought State
 * 
 * Paper-like neumorphism for grounded, externalized thoughts.
 * Spatial hierarchy via depth prop - recent thoughts are prominent,
 * older ones gently recede.
 */

import { useCallback, useEffect, useState } from 'react';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnchoredThoughtProps {
  thoughtId: string;
  depth?: number; // 0 = most recent, higher = older
}

export function AnchoredThought({ thoughtId, depth = 0 }: AnchoredThoughtProps) {
  const { thoughts, reactivateThought, deleteThought } = useWorkspaceStore();
  const [isSettling, setIsSettling] = useState(false);
  
  const thought = thoughts.find((t) => t.id === thoughtId);
  
  // Detect newly anchored thoughts for settling animation
  useEffect(() => {
    if (depth === 0 && thought?.state === 'anchored') {
      setIsSettling(true);
      const timer = setTimeout(() => setIsSettling(false), 400);
      return () => clearTimeout(timer);
    }
  }, [depth, thought?.state]);
  
  const handleClick = useCallback(() => {
    reactivateThought(thoughtId);
  }, [thoughtId, reactivateThought]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteThought(thoughtId);
  }, [thoughtId, deleteThought]);

  if (!thought) return null;

  // Spatial hierarchy: older thoughts gently recede
  const opacity = Math.max(0.6, 1 - depth * 0.08);
  const scale = Math.max(0.96, 1 - depth * 0.01);

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
        "hover:translate-y-[-2px]",
        isSettling && "animate-thought-settle"
      )}
      style={{
        opacity,
        transform: `scale(${scale})`,
      }}
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
        {/* Content - no timestamp, no metrics */}
        <p className={cn(
          "text-[var(--workspace-anchored-text)]",
          "text-base leading-relaxed",
          "whitespace-pre-wrap break-words",
          "line-clamp-6"
        )}>
          {thought.content}
        </p>
        
        {/* Delete on hover only - minimal, non-intrusive */}
        <button
          onClick={handleDelete}
          className={cn(
            "absolute top-3 right-3 p-1.5 rounded-lg",
            "text-[var(--workspace-anchored-muted)]",
            "opacity-0 group-hover:opacity-60",
            "hover:opacity-100 hover:text-red-500 hover:bg-red-500/10",
            "transition-all duration-200"
          )}
          aria-label="Delete thought"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
