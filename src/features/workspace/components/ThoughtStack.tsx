/**
 * Pillar #1: Thought Stack
 * 
 * Displays day threads - groups of thoughts organized by day.
 * Most recent day first, with ability to add to any previous day.
 */

import { useWorkspaceStore } from '../useWorkspaceStore';
import { DayThread } from './DayThread';
import { cn } from '@/lib/utils';

export function ThoughtStack() {
  const getDayThreads = useWorkspaceStore((state) => state.getDayThreads);
  const dayThreads = getDayThreads();

  if (dayThreads.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "thought-stack",
      "w-full max-w-2xl mx-auto",
      "space-y-10" // Generous spacing between days
    )}>
      {dayThreads.map((thread, index) => (
        <DayThread
          key={thread.day_key}
          thread={thread}
          isFirst={index === 0}
        />
      ))}
    </div>
  );
}
