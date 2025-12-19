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

import { useCallback, useState, useEffect } from 'react';
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

  // Reset user-initiated flag when thought is anchored
  const handleAnchor = useCallback(() => {
    setUserInitiated(false);
  }, []);

  // Handle canvas click (Option C: tap anywhere empty to start writing)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only trigger if clicking directly on the canvas (not on a thought card)
    const target = e.target as HTMLElement;
    const isOnThought = target.closest('.anchored-thought') || target.closest('.thinking-surface');
    
    if (!activeThought && !isOnThought) {
      setUserInitiated(true);
      createThought();
    }
  }, [activeThought, createThought]);

  // Global Enter key to start writing (when no thought is active)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Only trigger if no active thought and Enter is pressed
      // Ignore if user is typing elsewhere (input, textarea, contenteditable)
      const target = e.target as HTMLElement;
      const isTyping = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable;
      
      if (e.key === 'Enter' && !activeThought && !isTyping && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        setUserInitiated(true);
        createThought();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeThought, createThought]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-[var(--text-tertiary)] opacity-60">...</div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "workspace-canvas",
        "w-full min-h-screen",
        "px-4 py-8 md:px-8 md:py-12",
        // Option C: entire canvas is tappable when no active thought
        !activeThought && hasThoughts && "cursor-text"
      )}
      onClick={handleCanvasClick}
    >
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
            /* Warm breathing space - subtle indent inviting interaction */
            <div
              className="group min-h-[80px] rounded-2xl transition-all duration-300 ease-out flex items-center justify-center cursor-text"
              style={{
                background: '#EAE5E0',
                // Subtle warm indent
                boxShadow: `
                  inset 4px 4px 8px rgba(180, 165, 145, 0.15),
                  inset -4px -4px 8px rgba(255, 255, 255, 0.5)
                `
              }}
              onMouseEnter={(e) => {
                // Hint of PB blue on hover - invitation to think
                e.currentTarget.style.boxShadow = `
                  inset 4px 4px 8px rgba(180, 165, 145, 0.15),
                  inset -4px -4px 8px rgba(255, 255, 255, 0.5),
                  0 0 15px rgba(72, 159, 227, 0.08)
                `;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `
                  inset 4px 4px 8px rgba(180, 165, 145, 0.15),
                  inset -4px -4px 8px rgba(255, 255, 255, 0.5)
                `;
              }}
            >
              <span 
                className="text-sm transition-opacity duration-300 opacity-30 group-hover:opacity-50"
                style={{ color: '#A09890' }}
              >
                Tap to think
              </span>
            </div>
          ) : (
            <EmptyWorkspace onStartThinking={handleStartThinking} />
          )}
        </section>

        {/* Anchored Thoughts - no header, just presence */}
        {hasAnchoredThoughts && (
          <section onClick={(e) => e.stopPropagation()}>
            <ThoughtStack />
          </section>
        )}
      </div>
    </div>
  );
}
