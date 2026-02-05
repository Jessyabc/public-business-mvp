/**
 * Pillar #1: Individual Workspace - Supabase Sync
 * 
 * Handles persistence to workspace_thoughts table.
 * Debounced auto-save, offline-first with reconciliation.
 */

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspaceStore } from './useWorkspaceStore';
import type { ThoughtObject } from './types';

const SYNC_DEBOUNCE_MS = 1500;
const LOAD_TIMEOUT_MS = 10000; // 10 second timeout for loading

export function useWorkspaceSync() {
  const { user } = useAuth();
  const {
    thoughts,
    setThoughts,
    setActiveThought,
    setLoading,
    setSyncing,
    setLastSynced,
  } = useWorkspaceStore();
  
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const lastSyncedThoughtsRef = useRef<string>('');
  const loadAbortRef = useRef<AbortController | null>(null);

  // Load thoughts from Supabase on mount
  const loadThoughts = useCallback(async () => {
    if (!user) {
      // No user - ensure loading is false
      setLoading(false);
      return;
    }
    
    // Cancel any previous load operation
    if (loadAbortRef.current) {
      loadAbortRef.current.abort();
    }
    loadAbortRef.current = new AbortController();
    
    setLoading(true);
    
    // Set up a timeout to prevent infinite loading
    const timeoutId = window.setTimeout(() => {
      console.warn('Workspace loading timed out after', LOAD_TIMEOUT_MS, 'ms');
      setLoading(false);
    }, LOAD_TIMEOUT_MS);
    
    try {
      const { data, error } = await supabase
        .from('workspace_thoughts')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      // Clear timeout since we got a response
      window.clearTimeout(timeoutId);
      
      if (error) throw error;
      
      if (data && isMountedRef.current) {
        const loadedThoughts: ThoughtObject[] = data.map((row) => {
          // Derive day_key from anchored_at if available, otherwise created_at
          const dayKeySource = row.anchored_at || row.created_at;
          const dayKey = row.day_key || dayKeySource.split('T')[0];
          
          return {
            id: row.id,
            user_id: row.user_id,
            content: row.content,
            // Preserve state from database (should be 'anchored' for persisted thoughts)
            state: row.state === 'active' ? 'active' as const : 'anchored' as const,
            created_at: row.created_at,
            updated_at: row.updated_at,
            day_key: dayKey,
            display_label: row.display_label || null,
            anchored_at: row.anchored_at || null,
            chain_id: row.chain_id || null,
            edited_from_id: row.edited_from_id || null,
          };
        });
        
        // Merge with local thoughts (prefer newer, preserve active state)
        const localThoughts = useWorkspaceStore.getState().thoughts;
        const mergedThoughts = mergeThoughts(localThoughts, loadedThoughts);
        
        setThoughts(mergedThoughts);
        // Only clear active thought if it's not in the merged list or was anchored
        const currentActiveId = useWorkspaceStore.getState().activeThoughtId;
        if (currentActiveId) {
          const activeThought = mergedThoughts.find(t => t.id === currentActiveId);
          if (!activeThought || activeThought.state === 'anchored') {
            setActiveThought(null);
          }
        }
        lastSyncedThoughtsRef.current = JSON.stringify(mergedThoughts);
        setLastSynced(new Date().toISOString());
      }
    } catch (err) {
      console.error('Failed to load workspace thoughts:', err);
      // Clear timeout on error too
      window.clearTimeout(timeoutId);
    } finally {
      // Always set loading to false, even if unmounted (Zustand handles this safely)
      setLoading(false);
    }
  }, [user, setThoughts, setActiveThought, setLoading, setLastSynced]);

  // Sync thoughts to Supabase
  const syncThoughts = useCallback(async () => {
    if (!user) return;
    
    const currentThoughts = useWorkspaceStore.getState().thoughts;
    const currentJson = JSON.stringify(currentThoughts);
    
    // Skip if nothing changed
    if (currentJson === lastSyncedThoughtsRef.current) return;
    
    setSyncing(true);
    try {
      // Ensure all thoughts have valid day_key before syncing
      const thoughtsToSync = currentThoughts.map((t) => {
        // Ensure day_key is set
        let dayKey = t.day_key;
        if (!dayKey) {
          const dayKeySource = t.anchored_at || t.created_at;
          dayKey = dayKeySource.split('T')[0];
        }
        
        return {
          id: t.id,
          user_id: user.id,
          content: t.content,
          state: t.state,
          created_at: t.created_at,
          updated_at: t.updated_at,
          day_key: dayKey,
          display_label: t.display_label || null,
          anchored_at: t.anchored_at || null,
          chain_id: t.chain_id || null,
          edited_from_id: t.edited_from_id || null,
        };
      });

      if (thoughtsToSync.length > 0) {
        const { error } = await supabase
          .from('workspace_thoughts')
          .upsert(thoughtsToSync, { onConflict: 'id' });

        if (error) throw error;
      }
      
      lastSyncedThoughtsRef.current = currentJson;
      setLastSynced(new Date().toISOString());
    } catch (err) {
      console.error('Failed to sync workspace thoughts:', err);
    } finally {
      if (isMountedRef.current) {
        setSyncing(false);
      }
    }
  }, [user, setSyncing, setLastSynced]);

  // Debounced sync
  const debouncedSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(syncThoughts, SYNC_DEBOUNCE_MS);
  }, [syncThoughts]);

  // Load on mount - with proper cleanup
  useEffect(() => {
    isMountedRef.current = true;
    
    // Only load if we have a user
    if (user) {
      loadThoughts();
    } else {
      // Ensure loading is false when there's no user
      setLoading(false);
    }
    
    return () => {
      isMountedRef.current = false;
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      // Abort any pending load operation
      if (loadAbortRef.current) {
        loadAbortRef.current.abort();
      }
    };
  }, [user, loadThoughts, setLoading]);

  // Auto-sync when thoughts change (including when first thought is created)
  useEffect(() => {
    // Sync whenever we have a user and any thoughts exist
    // This ensures first thought gets persisted
    if (user && thoughts.length > 0) {
      debouncedSync();
    }
  }, [thoughts, user, debouncedSync]);

  // Force immediate sync when a thought is anchored
  useEffect(() => {
    const anchoredCount = thoughts.filter(t => t.state === 'anchored').length;
    if (user && anchoredCount > 0) {
      // Small delay to ensure state is settled, then force sync
      const timeoutId = setTimeout(() => {
        syncThoughts();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [thoughts.filter(t => t.state === 'anchored').length, user, syncThoughts]);

  // Sync before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      syncThoughts();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [syncThoughts]);

  return {
    loadThoughts,
    syncThoughts,
  };
}

// Merge local and remote thoughts, preferring newer versions
// Preserves active thoughts and ensures proper day_key assignment
function mergeThoughts(
  local: ThoughtObject[],
  remote: ThoughtObject[]
): ThoughtObject[] {
  const merged = new Map<string, ThoughtObject>();
  
  // Add remote thoughts first
  for (const thought of remote) {
    merged.set(thought.id, thought);
  }
  
  // Merge local thoughts (prefer newer, but preserve active state if local is active)
  for (const thought of local) {
    const existing = merged.get(thought.id);
    const localIsNewer = !existing || new Date(thought.updated_at) > new Date(existing.updated_at);
    
    if (localIsNewer) {
      // Use local version
      merged.set(thought.id, thought);
    } else if (existing && thought.state === 'active' && existing.state === 'anchored') {
      // Preserve local active state even if remote is newer (user is currently editing)
      merged.set(thought.id, { ...existing, state: 'active' });
    }
    
    // Ensure day_key is set for all thoughts
    const finalThought = merged.get(thought.id)!;
    if (!finalThought.day_key) {
      const dayKeySource = finalThought.anchored_at || finalThought.created_at;
      finalThought.day_key = dayKeySource.split('T')[0];
    }
  }
  
  // Ensure all thoughts have valid day_key
  Array.from(merged.values()).forEach((thought) => {
    if (!thought.day_key) {
      const dayKeySource = thought.anchored_at || thought.created_at;
      thought.day_key = dayKeySource.split('T')[0];
    }
  });
  
  // Sort by updated_at descending
  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}
