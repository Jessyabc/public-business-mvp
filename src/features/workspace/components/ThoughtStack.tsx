/**
 * Pillar #1: Thought Stack
 * 
 * Vertical list of anchored thoughts.
 * No pagination, no sorting controls - just your thoughts.
 */

import { useWorkspaceStore } from '../useWorkspaceStore';
import { AnchoredThought } from './AnchoredThought';
import { cn } from '@/lib/utils';

export function ThoughtStack() {
  const getAnchoredThoughts = useWorkspaceStore((state) => state.getAnchoredThoughts);
  const anchoredThoughts = getAnchoredThoughts();

  if (anchoredThoughts.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "thought-stack",
      "w-full max-w-2xl mx-auto",
      "space-y-4"
    )}>
      {anchoredThoughts.map((thought) => (
        <AnchoredThought key={thought.id} thoughtId={thought.id} />
      ))}
    </div>
  );
}
