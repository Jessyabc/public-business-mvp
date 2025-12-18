/**
 * Pillar #1: Workspace Canvas
 * 
 * The Individual Workspace - private cognitive sanctuary.
 * Orchestrates Active Thinking and Anchored Thoughts.
 */

/**
 * Pillar #1: Workspace Canvas
 * 
 * The Individual Workspace - private cognitive sanctuary.
 * A calm desk of thoughts, not a productivity tool.
 */

import { useCallback, useState } from 'react';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { useWorkspaceSync } from '../useWorkspaceSync';
import { ThinkingSurface } from './ThinkingSurface';
import { ThoughtStack } from './ThoughtStack';
import { EmptyWorkspace } from './EmptyWorkspace';
import { cn } from '@/lib/utils';

export function WorkspaceCanvas() {
  const { 
    thoughts,
    isLoading,
    isSyncing,
    createThought,
    getActiveThought,
  } = useWorkspaceStore();
  
  // Track if user deliberately started thinking (for auto-focus)
  const [userInitiated, setUserInitiated] = useState(false);
  
  // Initialize sync
  useWorkspaceSync();
  
  const activeThought = getActiveThought();
  const hasThoughts = thoughts.length > 0;
  const hasAnchoredThoughts = thoughts.some((t) => t.state === 'anchored');

  const handleStartThinking = useCallback(() => {
    setUserInitiated(true);
    createThought();
  }, [createThought]);

  const handleBreathingSpaceClick = useCallback(() => {
    if (!activeThought) {
      setUserInitiated(true);
      createThought();
    }
  }, [activeThought, createThought]);

  // Reset user-initiated flag when thought is anchored
  const handleAnchor = useCallback(() => {
    setUserInitiated(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-[var(--text-tertiary)] opacity-60">...</div>
      </div>
    );
  }

  return (
    <div className={cn(
      "workspace-canvas",
      "w-full min-h-screen",
      "px-4 py-8 md:px-8 md:py-12"
    )}>
      {/* Sync indicator - very subtle */}
      {isSyncing && (
        <div className="fixed top-4 right-4 z-50">
          <span className="text-xs text-[var(--text-tertiary)] opacity-30">
            ·
          </span>
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Breathing space / Active thinking area */}
        <section>
          {activeThought ? (
            <ThinkingSurface 
              thoughtId={activeThought.id}
              onAnchor={handleAnchor}
              autoFocus={userInitiated}
            />
          ) : hasThoughts ? (
            /* Subtle breathing space - ambient, not a button */
            <div
              onClick={handleBreathingSpaceClick}
              className={cn(
                "min-h-[80px] rounded-2xl cursor-text",
                "bg-transparent",
                "border border-transparent",
                "hover:bg-[var(--glass-bg)] hover:backdrop-blur-sm",
                "hover:border-[var(--workspace-active-border)]",
                "transition-all duration-500 ease-out",
                "flex items-center justify-center"
              )}
            >
              <span className="text-[var(--text-tertiary)] opacity-0 hover:opacity-40 transition-opacity duration-500">
                
              </span>
            </div>
          ) : (
            <EmptyWorkspace onStartThinking={handleStartThinking} />
          )}
        </section>

        {/* Anchored Thoughts - no header, just presence */}
        {hasAnchoredThoughts && (
          <section>
            <ThoughtStack />
          </section>
        )}
      </div>
    </div>
  );
}
