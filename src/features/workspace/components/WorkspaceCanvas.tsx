/**
 * Pillar #1: Workspace Canvas
 *
 * The Individual Workspace - private cognitive sanctuary.
 * Orchestrates Active Thinking and the continuous ThinkFeed.
 *
 * Chain of Thoughts: No day grouping, explicit chain breaks only.
 */

import { useCallback, useState, useEffect, useRef } from 'react';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { useWorkspaceSync } from '../useWorkspaceSync';
import { useChainStore } from '../stores/chainStore';
import { useFeedStore } from '../stores/feedStore';
import { useChainSync } from '../useChainSync';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
 import { useLinkSync } from '../hooks/useLinkSync';
 import { useEmbedThought } from '../hooks/useThoughtSearch';
import { ThinkingSurface } from './ThinkingSurface';
 import { ThinkFeed } from './ThinkFeed';
 import { OpenCircle } from './OpenCircle';
import { EmptyWorkspace } from './EmptyWorkspace';
import { ContinuePrompt } from './ContinuePrompt';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
    setLoading,
  } = useWorkspaceStore();
  const { breakChain, activeChainId } = useChainStore();
  const { scope, focusedChainId } = useFeedStore();
  
  // Prevent immediate re-open after blur closes the thought
  const justAnchoredRef = useRef(false);
  const [showChainNaming, setShowChainNaming] = useState(false);
  const [newChainId, setNewChainId] = useState<string | null>(null);
  const [chainNameDraft, setChainNameDraft] = useState('');
  const chainNameInputRef = useRef<HTMLInputElement>(null);
  
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
  const { isConnected } = useRealtimeSync(); // Cross-device realtime updates
   useLinkSync(); // Chain links sync
   const { embedThought } = useEmbedThought();
  
  const activeThought = getActiveThought();
  const hasThoughts = thoughts.length > 0;
  const hasAnchoredThoughts = thoughts.some((t) => t.state === 'anchored');

  const handleStartThinking = useCallback(() => {
    setUserInitiated(true);
    // If viewing a specific chain, use that as the target chain
    const targetChainId = scope === 'chain' && focusedChainId ? focusedChainId : undefined;
    createThought(undefined, user?.id, undefined, targetChainId);
  }, [createThought, user?.id, scope, focusedChainId]);
 
   // Handle break chain gesture
    const handleBreakChain = useCallback(() => {
      if (!user) return;
      
      const lastThoughtInChain = thoughts
        .filter(t => t.chain_id === activeChainId && t.state === 'anchored')
        .sort((a, b) => {
          const timeA = new Date(a.anchored_at || a.created_at).getTime();
          const timeB = new Date(b.anchored_at || b.created_at).getTime();
          return timeB - timeA;
        })[0];
      
      const chainId = breakChain(user.id, activeChainId, lastThoughtInChain?.id ?? null);
      
      // Show naming prompt
      setNewChainId(chainId);
      setChainNameDraft('');
      setShowChainNaming(true);
      setTimeout(() => chainNameInputRef.current?.focus(), 150);
    }, [user, breakChain, activeChainId, thoughts]);

    const handleSaveChainName = useCallback(() => {
      if (newChainId) {
        const trimmed = chainNameDraft.trim();
        if (trimmed) {
          const { updateChainLabel } = useChainStore.getState();
          updateChainLabel(newChainId, trimmed);
          // Persist to Supabase
          if (user) {
            supabase
              .from('thought_chains')
              .update({ display_label: trimmed, updated_at: new Date().toISOString() })
              .eq('id', newChainId)
              .eq('user_id', user.id)
              .then(() => {});
          }
        }
      }
      setShowChainNaming(false);
      setNewChainId(null);
      setChainNameDraft('');
    }, [newChainId, chainNameDraft, user]);

    const handleSkipChainName = useCallback(() => {
      setShowChainNaming(false);
      setNewChainId(null);
      setChainNameDraft('');
    }, []);

   // Reset user-initiated flag when thought is anchored, embed for search, and prevent immediate re-open
   const handleAnchor = useCallback((thoughtId?: string) => {
    setUserInitiated(false);
    justAnchoredRef.current = true;
    // Reset after a short delay to allow click events to complete
    setTimeout(() => {
      justAnchoredRef.current = false;
    }, 100);
     
     // Embed the thought for semantic search (fire and forget)
     if (thoughtId) {
       embedThought(thoughtId).catch(console.error);
     }
   }, [embedThought]);

  // Handle canvas click (tap anywhere empty to start writing or blur active thought)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Prevent re-opening immediately after blur closed the thought
    if (justAnchoredRef.current) {
      return;
    }
    
    const target = e.target as HTMLElement;
    // Check if click is on an interactive element that should not trigger new thought
    const isOnThought = target.closest('.anchored-thought') || 
                         target.closest('.thought-card') ||
                        target.closest('.thinking-surface') ||
                         target.closest('.think-feed') ||
                         target.closest('.open-circle') ||
                         target.closest('.chain-start-marker') ||
                         target.closest('.feed-scope-indicator') ||
                        target.closest('button') ||
                        target.closest('input') ||
                        target.closest('textarea') ||
                        target.closest('a');
    
    // If there's an active thought and clicking outside, blur it (which will cancel if no changes)
    if (activeThought && !isOnThought) {
      const textarea = document.querySelector('.thinking-surface textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.blur();
      }
      return;
    }
    
    if (!activeThought && !isOnThought) {
      setUserInitiated(true);
      // If viewing a specific chain, use that as the target chain
      const targetChainId = scope === 'chain' && focusedChainId ? focusedChainId : undefined;
      createThought(undefined, user?.id, undefined, targetChainId);
    }
  }, [activeThought, createThought, user?.id, scope, focusedChainId]);

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
        // If viewing a specific chain, use that as the target chain
        const { scope: currentScope, focusedChainId: currentFocusedChain } = useFeedStore.getState();
        const targetChainId = currentScope === 'chain' && currentFocusedChain ? currentFocusedChain : undefined;
        createThought(undefined, user?.id, undefined, targetChainId);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
   }, [activeThought, createThought, user?.id]);

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
      {/* Sync indicator */}
      {isSyncing && (
        <div className="fixed top-4 right-4 z-50">
          <span className="text-xs text-[var(--text-tertiary)] opacity-30">
            ·
          </span>
        </div>
      )}

      {/* Offline indicator */}
      {!isConnected && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: 'rgba(199, 120, 50, 0.15)',
              color: '#C77832',
              border: '1px solid rgba(199, 120, 50, 0.3)',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Reconnecting...
          </div>
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
             /* Input area with break control below */
             <div className="flex flex-col items-center gap-2">
               {/* Continue prompt (shows after 30min inactivity) */}
               <ContinuePrompt className="mb-1" />
               
               {/* Tap to think hint box */}
               <div
                 className="group min-h-[56px] w-full rounded-2xl transition-all duration-300 ease-out flex items-center justify-center cursor-text"
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
                   className="text-sm transition-opacity duration-300 opacity-25 group-hover:opacity-45"
                   style={{ color: '#A09890' }}
                 >
                   Tap to think
                 </span>
               </div>
               
                {/* Chain naming prompt (appears after break gesture) */}
                {showChainNaming && (
                  <div 
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl"
                    style={{
                      background: 'rgba(72, 159, 227, 0.08)',
                      border: '1px solid rgba(72, 159, 227, 0.2)',
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <span className="text-xs whitespace-nowrap" style={{ color: '#489FE3' }}>
                      Name this chain:
                    </span>
                    <input
                      ref={chainNameInputRef}
                      type="text"
                      value={chainNameDraft}
                      onChange={(e) => setChainNameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveChainName();
                        if (e.key === 'Escape') handleSkipChainName();
                      }}
                      placeholder="Optional..."
                      className="flex-1 bg-transparent border-none outline-none text-sm min-w-0"
                      style={{ color: '#4A443D' }}
                    />
                    <button
                      onClick={handleSaveChainName}
                      className="text-xs px-2 py-1 rounded-lg font-medium"
                      style={{ color: '#489FE3', background: 'rgba(72, 159, 227, 0.12)' }}
                    >
                      Save
                    </button>
                    <button
                      onClick={handleSkipChainName}
                      className="text-xs px-2 py-1 rounded-lg"
                      style={{ color: '#A09890' }}
                    >
                      Skip
                    </button>
                  </div>
                )}

                {/* Break control (+ button) BETWEEN input and feed */}
                <div className="flex justify-center py-1">
                  <OpenCircle
                    onContinue={handleStartThinking}
                    onBreak={handleBreakChain}
                    size="sm"
                  />
                </div>
            </div>
          ) : (
            <EmptyWorkspace onStartThinking={handleStartThinking} />
          )}
        </section>

         {/* ThinkFeed - continuous feed of all thoughts */}
        {hasAnchoredThoughts && (
          <section className="-mt-2">
             <ThinkFeed />
          </section>
        )}
      </div>
    </div>
  );
}
