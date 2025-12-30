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

  // Load thoughts from Supabase on mount
  const loadThoughts = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workspace_thoughts')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      if (data && isMountedRef.current) {
        const loadedThoughts: ThoughtObject[] = data.map((row) => ({
          id: row.id,
          user_id: row.user_id,
          content: row.content,
          // Normalize all loaded thoughts to anchored state
          state: 'anchored' as const,
          created_at: row.created_at,
          updated_at: row.updated_at,
          // Use stored day_key or derive from created_at
          day_key: row.day_key || row.created_at.split('T')[0],
          display_label: row.display_label || null,
          anchored_at: row.anchored_at || null,
        }));
        
        // Merge with local thoughts (prefer newer)
        const localThoughts = useWorkspaceStore.getState().thoughts;
        const normalizedLocal = localThoughts.map(t => ({
          ...t,
          state: 'anchored' as const
        }));
        const mergedThoughts = mergeThoughts(normalizedLocal, loadedThoughts);
        
        setThoughts(mergedThoughts);
        setActiveThought(null);
        lastSyncedThoughtsRef.current = JSON.stringify(mergedThoughts);
        setLastSynced(new Date().toISOString());
      }
    } catch (err) {
      console.error('Failed to load workspace thoughts:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
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
      // Upsert all thoughts with new columns
      const thoughtsWithUser = currentThoughts.map((t) => ({
        id: t.id,
        user_id: user.id,
        content: t.content,
        state: t.state,
        created_at: t.created_at,
        updated_at: t.updated_at,
        day_key: t.day_key,
        display_label: t.display_label || null,
        anchored_at: t.anchored_at || null,
      }));

      if (thoughtsWithUser.length > 0) {
        const { error } = await supabase
          .from('workspace_thoughts')
          .upsert(thoughtsWithUser, { onConflict: 'id' });

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

  // Load on mount
  useEffect(() => {
    isMountedRef.current = true;
    loadThoughts();
    
    return () => {
      isMountedRef.current = false;
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [loadThoughts]);

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
function mergeThoughts(
  local: ThoughtObject[],
  remote: ThoughtObject[]
): ThoughtObject[] {
  const merged = new Map<string, ThoughtObject>();
  
  // Add remote thoughts
  for (const thought of remote) {
    merged.set(thought.id, thought);
  }
  
  // Merge local thoughts (prefer newer)
  for (const thought of local) {
    const existing = merged.get(thought.id);
    if (!existing || new Date(thought.updated_at) > new Date(existing.updated_at)) {
      merged.set(thought.id, thought);
    }
  }
  
  // Sort by updated_at descending
  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}
