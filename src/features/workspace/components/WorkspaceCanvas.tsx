/**
 * Pillar #1: Workspace Canvas
 * 
 * The Individual Workspace - private cognitive sanctuary.
 * Orchestrates Active Thinking and Anchored Thoughts.
 */

import { useCallback } from 'react';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { useWorkspaceSync } from '../useWorkspaceSync';
import { ThinkingSurface } from './ThinkingSurface';
import { ThoughtStack } from './ThoughtStack';
import { EmptyWorkspace } from './EmptyWorkspace';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

export function WorkspaceCanvas() {
  const { 
    thoughts,
    activeThoughtId, 
    isLoading,
    isSyncing,
    createThought,
    getActiveThought,
  } = useWorkspaceStore();
  
  // Initialize sync
  useWorkspaceSync();
  
  const activeThought = getActiveThought();
  const hasThoughts = thoughts.length > 0;
  const hasAnchoredThoughts = thoughts.some((t) => t.state === 'anchored');

  const handleStartThinking = useCallback(() => {
    createThought();
  }, [createThought]);

  const handleNewThought = useCallback(() => {
    createThought();
  }, [createThought]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-[var(--text-secondary)]">Loading your thoughts...</div>
      </div>
    );
  }

  return (
    <div className={cn(
      "workspace-canvas",
      "w-full min-h-screen",
      "px-4 py-8 md:px-8 md:py-12"
    )}>
      {/* Sync indicator - subtle */}
      {isSyncing && (
        <div className="fixed top-4 right-4 z-50">
          <span className="text-xs text-[var(--text-tertiary)] opacity-50">
            Saving...
          </span>
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-12">
        {/* Active Thinking Area */}
        <section className="space-y-6">
          {activeThought ? (
            <ThinkingSurface 
              thoughtId={activeThought.id}
              onAnchor={() => {}}
            />
          ) : hasThoughts ? (
            /* New thought button - when not actively thinking */
            <div className="flex justify-center">
              <button
                onClick={handleNewThought}
                className={cn(
                  "flex items-center gap-2",
                  "px-6 py-3 rounded-xl",
                  "bg-[var(--glass-bg)] backdrop-blur-lg",
                  "border border-[var(--workspace-active-border)]",
                  "text-[var(--text-secondary)]",
                  "hover:text-[var(--text-primary)]",
                  "hover:border-[hsl(var(--workspace-focus)/0.3)]",
                  "hover:shadow-[var(--workspace-active-glow)]",
                  "transition-all duration-300"
                )}
              >
                <Plus className="w-5 h-5" />
                <span>New thought</span>
              </button>
            </div>
          ) : (
            <EmptyWorkspace onStartThinking={handleStartThinking} />
          )}
        </section>

        {/* Anchored Thoughts */}
        {hasAnchoredThoughts && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent opacity-30" />
              <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
                Stored thoughts
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--border)] to-transparent opacity-30" />
            </div>
            
            <ThoughtStack />
          </section>
        )}
      </div>
    </div>
  );
}
