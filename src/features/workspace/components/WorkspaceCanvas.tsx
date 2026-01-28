/**
 * Pillar #1: Workspace Canvas
 * 
 * The Individual Workspace - private cognitive sanctuary.
 * Orchestrates Active Thinking and Day Threads.
 * 
 * Daily threading: Each day creates a new thread.
 * Tap breathing space to start today's thinking.
 * Open previous days to continue adding thoughts.
 */

import { useCallback, useState, useEffect, useRef } from 'react';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { useWorkspaceSync } from '../useWorkspaceSync';
import { useChainStore } from '../stores/chainStore';
import { useChainSync } from '../useChainSync';
import { ThinkingSurface } from './ThinkingSurface';
import { ThoughtStack } from './ThoughtStack';
import { EmptyWorkspace } from './EmptyWorkspace';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// Safety timeout for workspace loading (in case sync gets stuck)
const LOADING_TIMEOUT_MS = 15000;

export function WorkspaceCanvas() {
  const { user } = useAuth();
  const { 
    thoughts,
    isLoading,
    isSyncing,
    createThought,
    getActiveThought,
    activeDayKey,
    setActiveDayKey,
    setLoading,
  } = useWorkspaceStore();
  
  // Prevent immediate re-open after blur closes the thought
  const justAnchoredRef = useRef(false);
  
  // Safety timeout for loading state
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  
  useEffect(() => {
    if (!isLoading) {
      setLoadingTimedOut(false);
      return;
    }
    
    const timeoutId = window.setTimeout(() => {
      console.warn('WorkspaceCanvas: Loading timed out, forcing render');
      setLoadingTimedOut(true);
      // Also force the store to reset loading
      setLoading(false);
    }, LOADING_TIMEOUT_MS);
    
    return () => window.clearTimeout(timeoutId);
  }, [isLoading, setLoading]);
  
  // Track if user deliberately started thinking (for auto-focus)
  const [userInitiated, setUserInitiated] = useState(false);
  
  // Initialize sync for thoughts and chains
  useWorkspaceSync();
  useChainSync();
  
  const activeThought = getActiveThought();
  const hasThoughts = thoughts.length > 0;
  const hasAnchoredThoughts = thoughts.some((t) => t.state === 'anchored');

  const handleStartThinking = useCallback(() => {
    setUserInitiated(true);
    setActiveDayKey(null); // New thought = today
    createThought(undefined, user?.id);
  }, [createThought, setActiveDayKey, user?.id]);

  // Reset user-initiated flag when thought is anchored and prevent immediate re-open
  const handleAnchor = useCallback(() => {
    setUserInitiated(false);
    justAnchoredRef.current = true;
    // Reset after a short delay to allow click events to complete
    setTimeout(() => {
      justAnchoredRef.current = false;
    }, 100);
  }, []);

  // Handle canvas click (tap anywhere empty to start writing)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Prevent re-opening immediately after blur closed the thought
    if (justAnchoredRef.current) {
      return;
    }
    
    const target = e.target as HTMLElement;
    // Check if click is on an interactive element that should not trigger new thought
    const isOnThought = target.closest('.anchored-thought') || 
                        target.closest('.thinking-surface') ||
                        target.closest('.day-thread') ||
                        target.closest('button') ||
                        target.closest('input') ||
                        target.closest('textarea') ||
                        target.closest('a');
    
    if (!activeThought && !isOnThought) {
      setUserInitiated(true);
      setActiveDayKey(null); // New thought = today
      createThought(undefined, user?.id);
    }
  }, [activeThought, createThought, setActiveDayKey, user?.id]);

  // Global Enter key to start writing (when no thought is active)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable;
      
      if (e.key === 'Enter' && !activeThought && !isTyping && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        setUserInitiated(true);
        setActiveDayKey(null);
        createThought(undefined, user?.id);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeThought, createThought, setActiveDayKey, user?.id]);

  // Show loading only if we're actually loading and haven't timed out
  if (isLoading && !loadingTimedOut) {
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
        "px-4 pt-8 pb-32 md:px-8 md:pt-12 md:pb-36",
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
                boxShadow: `
                  inset 4px 4px 8px rgba(180, 165, 145, 0.15),
                  inset -4px -4px 8px rgba(255, 255, 255, 0.5)
                `
              }}
              onMouseEnter={(e) => {
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

        {/* Day Threads */}
        {hasAnchoredThoughts && (
          <section>
            <ThoughtStack />
          </section>
        )}
      </div>
    </div>
  );
}
