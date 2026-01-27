/**
 * Think Space: Chain Sync Hook
 * 
 * Syncs thought_chains with Supabase.
 * Runs alongside useWorkspaceSync.
 */

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useChainStore } from './stores/chainStore';
import type { ThoughtChain } from './types/chain';

const SYNC_DEBOUNCE_MS = 1500;

export function useChainSync() {
  const { user } = useAuth();
  const {
    chains,
    setChains,
    setLoadingChains,
    setSyncingChains,
  } = useChainStore();
  
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const lastSyncedChainsRef = useRef<string>('');

  // Load chains from Supabase on mount
  const loadChains = useCallback(async () => {
    if (!user) {
      setLoadingChains(false);
      return;
    }
    
    setLoadingChains(true);
    
    try {
      const { data, error } = await supabase
        .from('thought_chains')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && isMountedRef.current) {
        const loadedChains: ThoughtChain[] = data.map((row) => ({
          id: row.id,
          user_id: row.user_id,
          created_at: row.created_at,
          first_thought_at: row.first_thought_at,
          display_label: row.display_label,
          updated_at: row.updated_at,
        }));
        
        // Merge with local chains (prefer newer)
        const localChains = useChainStore.getState().chains;
        const mergedChains = mergeChains(localChains, loadedChains);
        
        setChains(mergedChains);
        lastSyncedChainsRef.current = JSON.stringify(mergedChains);
      }
    } catch (err) {
      console.error('Failed to load chains:', err);
    } finally {
      setLoadingChains(false);
    }
  }, [user, setChains, setLoadingChains]);

  // Sync chains to Supabase
  const syncChains = useCallback(async () => {
    if (!user) return;
    
    const currentChains = useChainStore.getState().chains;
    const currentJson = JSON.stringify(currentChains);
    
    // Skip if nothing changed
    if (currentJson === lastSyncedChainsRef.current) return;
    
    setSyncingChains(true);
    try {
      const chainsToSync = currentChains.map((c) => ({
        id: c.id,
        user_id: user.id,
        created_at: c.created_at,
        first_thought_at: c.first_thought_at,
        display_label: c.display_label,
        updated_at: c.updated_at,
      }));

      if (chainsToSync.length > 0) {
        const { error } = await supabase
          .from('thought_chains')
          .upsert(chainsToSync, { onConflict: 'id' });

        if (error) throw error;
      }
      
      lastSyncedChainsRef.current = currentJson;
    } catch (err) {
      console.error('Failed to sync chains:', err);
    } finally {
      if (isMountedRef.current) {
        setSyncingChains(false);
      }
    }
  }, [user, setSyncingChains]);

  // Debounced sync
  const debouncedSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(syncChains, SYNC_DEBOUNCE_MS);
  }, [syncChains]);

  // Load on mount
  useEffect(() => {
    isMountedRef.current = true;
    
    if (user) {
      loadChains();
    } else {
      setLoadingChains(false);
    }
    
    return () => {
      isMountedRef.current = false;
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user, loadChains, setLoadingChains]);

  // Auto-sync when chains change
  useEffect(() => {
    if (user && chains.length > 0) {
      debouncedSync();
    }
  }, [chains, user, debouncedSync]);

  return {
    loadChains,
    syncChains,
  };
}

// Merge local and remote chains, preferring newer versions
function mergeChains(
  local: ThoughtChain[],
  remote: ThoughtChain[]
): ThoughtChain[] {
  const merged = new Map<string, ThoughtChain>();
  
  // Add remote chains first
  for (const chain of remote) {
    merged.set(chain.id, chain);
  }
  
  // Merge local chains (prefer newer)
  for (const chain of local) {
    const existing = merged.get(chain.id);
    const localIsNewer = !existing || new Date(chain.updated_at) > new Date(existing.updated_at);
    
    if (localIsNewer) {
      merged.set(chain.id, chain);
    }
  }
  
  // Sort by created_at descending
  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
