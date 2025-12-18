/**
 * Pillar #1: Thought Stack
 * 
 * Anchored thoughts with spatial hierarchy.
 * Recent thoughts are more prominent, older ones gently recede.
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
      "space-y-3"
    )}>
      {anchoredThoughts.map((thought, index) => (
        <AnchoredThought 
          key={thought.id} 
          thoughtId={thought.id} 
          depth={index}
        />
      ))}
    </div>
  );
}
