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
import { BreakComposer } from './BreakComposer';
import { EmptyWorkspace } from './EmptyWorkspace';
import { ContinuePrompt } from './ContinuePrompt';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const LOADING_TIMEOUT_MS = 15000;

export function WorkspaceCanvas() {
  const { user } = useAuth();
  const { 
    thoughts,
    isLoading,
    isSyncing,
    createThought,
    getActiveThought,
    anchorThought,
    deleteThought,
    cancelEdit,
    setLoading,
  } = useWorkspaceStore();
  const { breakChain, activeChainId } = useChainStore();
  const { scope, focusedChainId } = useFeedStore();
  
  const justAnchoredRef = useRef(false);
  const wasAnchoredRef = useRef(false);
  const [showBreakComposer, setShowBreakComposer] = useState(false);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  
  useEffect(() => {
    if (!isLoading) {
      setLoadingTimedOut(false);
      return;
    }
    const timeoutId = window.setTimeout(() => {
      console.warn('WorkspaceCanvas: Loading timed out, forcing render');
      setLoadingTimedOut(true);
      setLoading(false);
    }, LOADING_TIMEOUT_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isLoading, setLoading]);
  
  const [userInitiated, setUserInitiated] = useState(false);
  
  const { loadMoreThoughts } = useWorkspaceSync();
  useChainSync();
  const { isConnected } = useRealtimeSync();
  useLinkSync();
  const { embedThought } = useEmbedThought();
  
  const activeThought = getActiveThought();
  const hasThoughts = thoughts.length > 0;
  const hasAnchoredThoughts = thoughts.some((t) => t.state === 'anchored');

  // Track if current active thought was reactivated from anchored state
  useEffect(() => {
    if (activeThought?.anchored_at) {
      wasAnchoredRef.current = true;
    } else {
      wasAnchoredRef.current = false;
    }
  }, [activeThought?.id]);

  const handleStartThinking = useCallback(() => {
    setUserInitiated(true);
    const targetChainId = scope === 'chain' && focusedChainId ? focusedChainId : undefined;
    createThought(undefined, user?.id, undefined, targetChainId);
  }, [createThought, user?.id, scope, focusedChainId]);
 
  const handleBreakChain = useCallback(() => {
    setShowBreakComposer(true);
  }, []);

  const handleBreakSubmit = useCallback((content: string, chainLabel: string) => {
    if (!user) return;
    
    const lastThoughtInChain = thoughts
      .filter(t => t.chain_id === activeChainId && t.state === 'anchored')
      .sort((a, b) => {
        const timeA = new Date(a.anchored_at || a.created_at).getTime();
        const timeB = new Date(b.anchored_at || b.created_at).getTime();
        return timeB - timeA;
      })[0];
    
    const chainId = breakChain(user.id, activeChainId, lastThoughtInChain?.id ?? null);
    
    if (chainLabel) {
      const { updateChainLabel } = useChainStore.getState();
      updateChainLabel(chainId, chainLabel);
      supabase
        .from('thought_chains')
        .update({ display_label: chainLabel, updated_at: new Date().toISOString() })
        .eq('id', chainId)
        .eq('user_id', user.id)
        .then(() => {});
    }
    
    // Create and immediately anchor the first thought in the new chain
    const thoughtId = createThought(undefined, user.id, chainId);
    useWorkspaceStore.getState().updateThought(thoughtId, content);
    useWorkspaceStore.getState().anchorThought(thoughtId);
    
    embedThought(thoughtId).catch(console.error);
    
    setShowBreakComposer(false);
    
    setTimeout(() => {
      setUserInitiated(true);
      createThought(undefined, user.id, chainId);
    }, 100);
  }, [user, breakChain, activeChainId, thoughts, createThought, embedThought]);

  const handleBreakCancel = useCallback(() => {
    setShowBreakComposer(false);
  }, []);

  const handleAnchor = useCallback((thoughtId?: string) => {
    setUserInitiated(false);
    justAnchoredRef.current = true;
    setTimeout(() => {
      justAnchoredRef.current = false;
    }, 100);
     
    if (thoughtId) {
      embedThought(thoughtId).catch(console.error);
    }
  }, [embedThought]);

  // Directly anchor active thought (used when clicking away)
  const anchorActiveThought = useCallback(() => {
    if (!activeThought) return;
    
    const content = activeThought.content.trim();
    const wasAnchored = wasAnchoredRef.current;
    
    // Blur textarea to prevent double-fire
    const textarea = document.querySelector('.thinking-surface textarea') as HTMLTextAreaElement;
    if (textarea && document.activeElement === textarea) {
      textarea.setAttribute('data-skip-blur', 'true');
      textarea.blur();
    }
    
    if (!content) {
      deleteThought(activeThought.id);
    } else if (wasAnchored) {
      cancelEdit(activeThought.id, content);
    } else {
      anchorThought(activeThought.id);
    }
    
    handleAnchor(activeThought.id);
  }, [activeThought, anchorThought, deleteThought, cancelEdit, handleAnchor]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (justAnchoredRef.current) return;
    
    const target = e.target as HTMLElement;
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
    
    if (activeThought && !isOnThought) {
      anchorActiveThought();
      return;
    }
    
    if (!activeThought && !isOnThought) {
      setUserInitiated(true);
      const targetChainId = scope === 'chain' && focusedChainId ? focusedChainId : undefined;
      createThought(undefined, user?.id, undefined, targetChainId);
    }
  }, [activeThought, anchorActiveThought, createThought, user?.id, scope, focusedChainId]);

  // Global Enter key to start writing
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
        const { scope: currentScope, focusedChainId: currentFocusedChain } = useFeedStore.getState();
        const targetChainId = currentScope === 'chain' && currentFocusedChain ? currentFocusedChain : undefined;
        createThought(undefined, user?.id, undefined, targetChainId);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
   }, [activeThought, createThought, user?.id]);

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
          <span className="text-xs text-[var(--text-tertiary)] opacity-30">·</span>
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
        <section>
          {activeThought ? (
            <ThinkingSurface 
              thoughtId={activeThought.id}
              onAnchor={handleAnchor}
              autoFocus={userInitiated}
              wasAnchored={wasAnchoredRef.current}
            />
          ) : hasThoughts ? (
             <div className="flex flex-col items-center gap-2">
               <ContinuePrompt className="mb-1" />
               
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
               
                <div className="flex justify-center py-1">
                  <OpenCircle
                    onBreak={handleBreakChain}
                    size="sm"
                  />
                </div>
            </div>
          ) : (
            <EmptyWorkspace onStartThinking={handleStartThinking} />
          )}
        </section>

        {hasAnchoredThoughts && (
          <section className="-mt-2">
              <ThinkFeed onLoadMore={loadMoreThoughts} />
           </section>
        )}
      </div>

      <BreakComposer
        isOpen={showBreakComposer}
        onSubmit={handleBreakSubmit}
        onCancel={handleBreakCancel}
      />
    </div>
  );
}
