/**
 * Pillar #1: Individual Workspace - Supabase Sync
 * 
 * Handles persistence to workspace_thoughts table.
 * Cursor-based pagination, debounced auto-save, offline-first.
 */

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspaceStore } from './useWorkspaceStore';
import type { ThoughtObject } from './types';

const SYNC_DEBOUNCE_MS = 1500;
const LOAD_TIMEOUT_MS = 10000;
const PAGE_SIZE = 40;

export function useWorkspaceSync() {
  const { user } = useAuth();
  const {
    thoughts,
    setThoughts,
    setActiveThought,
    setLoading,
    setSyncing,
    setLastSynced,
    hasMorePages,
    setHasMorePages,
    oldestLoadedAt,
    setOldestLoadedAt,
  } = useWorkspaceStore();
  
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const lastSyncedThoughtsRef = useRef<string>('');
  const isLoadingMoreRef = useRef(false);

  // Load first page of thoughts
  const loadThoughts = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const timeoutId = window.setTimeout(() => {
      console.warn('Workspace loading timed out');
      setLoading(false);
    }, LOAD_TIMEOUT_MS);
    
    try {
      const { data, error } = await supabase
        .from('workspace_thoughts')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(PAGE_SIZE);

      window.clearTimeout(timeoutId);
      if (error) throw error;
      
      if (data && isMountedRef.current) {
        const loaded = mapRows(data);
        const localThoughts = useWorkspaceStore.getState().thoughts;
        const merged = mergeThoughts(localThoughts, loaded);
        
        setThoughts(merged);
        setHasMorePages(data.length === PAGE_SIZE);
        if (data.length > 0) {
          setOldestLoadedAt(data[data.length - 1].updated_at);
        }

        // Clear stale active thought
        const currentActiveId = useWorkspaceStore.getState().activeThoughtId;
        if (currentActiveId) {
          const active = merged.find(t => t.id === currentActiveId);
          if (!active || active.state === 'anchored') setActiveThought(null);
        }
        lastSyncedThoughtsRef.current = JSON.stringify(merged);
        setLastSynced(new Date().toISOString());
      }
    } catch (err) {
      console.error('Failed to load workspace thoughts:', err);
      window.clearTimeout(timeoutId);
    } finally {
      setLoading(false);
    }
  }, [user, setThoughts, setActiveThought, setLoading, setLastSynced, setHasMorePages, setOldestLoadedAt]);

  // Load next page (cursor-based)
  const loadMoreThoughts = useCallback(async () => {
    if (!user || !hasMorePages || isLoadingMoreRef.current || !oldestLoadedAt) return;
    
    isLoadingMoreRef.current = true;
    try {
      const { data, error } = await supabase
        .from('workspace_thoughts')
        .select('*')
        .eq('user_id', user.id)
        .lt('updated_at', oldestLoadedAt)
        .order('updated_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;
      
      if (data && isMountedRef.current) {
        const loaded = mapRows(data);
        const current = useWorkspaceStore.getState().thoughts;
        // Append without duplicates
        const existingIds = new Set(current.map(t => t.id));
        const newThoughts = loaded.filter(t => !existingIds.has(t.id));
        
        if (newThoughts.length > 0) {
          setThoughts([...current, ...newThoughts]);
        }
        setHasMorePages(data.length === PAGE_SIZE);
        if (data.length > 0) {
          setOldestLoadedAt(data[data.length - 1].updated_at);
        }
      }
    } catch (err) {
      console.error('Failed to load more thoughts:', err);
    } finally {
      isLoadingMoreRef.current = false;
    }
  }, [user, hasMorePages, oldestLoadedAt, setThoughts, setHasMorePages, setOldestLoadedAt]);

  // Sync thoughts to Supabase
  const syncThoughts = useCallback(async () => {
    if (!user) return;
    
    const currentThoughts = useWorkspaceStore.getState().thoughts;
    const currentJson = JSON.stringify(currentThoughts);
    if (currentJson === lastSyncedThoughtsRef.current) return;
    
    setSyncing(true);
    try {
      const thoughtsToSync = currentThoughts.map((t) => ({
        id: t.id,
        user_id: user.id,
        content: t.content,
        state: t.state,
        created_at: t.created_at,
        updated_at: t.updated_at,
        day_key: t.day_key || (t.anchored_at || t.created_at).split('T')[0],
        display_label: t.display_label || null,
        anchored_at: t.anchored_at || null,
        chain_id: t.chain_id || null,
        edited_from_id: t.edited_from_id || null,
      }));

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
      if (isMountedRef.current) setSyncing(false);
    }
  }, [user, setSyncing, setLastSynced]);

  // Debounced sync
  const debouncedSync = useCallback(() => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(syncThoughts, SYNC_DEBOUNCE_MS);
  }, [syncThoughts]);

  // Load on mount
  useEffect(() => {
    isMountedRef.current = true;
    if (user) loadThoughts();
    else setLoading(false);
    
    return () => {
      isMountedRef.current = false;
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [user, loadThoughts, setLoading]);

  // Auto-sync on changes
  useEffect(() => {
    if (user && thoughts.length > 0) debouncedSync();
  }, [thoughts, user, debouncedSync]);

  // Immediate sync on anchor count change
  const anchoredCount = thoughts.filter(t => t.state === 'anchored').length;
  useEffect(() => {
    if (user && anchoredCount > 0) {
      const id = setTimeout(() => syncThoughts(), 500);
      return () => clearTimeout(id);
    }
  }, [anchoredCount, user, syncThoughts]);

  // Sync before unload
  useEffect(() => {
    const handler = () => syncThoughts();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [syncThoughts]);

  return { loadThoughts, syncThoughts, loadMoreThoughts };
}

// --- Helpers ---

function mapRows(data: any[]): ThoughtObject[] {
  return data.map((row) => {
    const dayKeySource = row.anchored_at || row.created_at;
    return {
      id: row.id,
      user_id: row.user_id,
      content: row.content,
      state: row.state as 'active' | 'anchored',
      created_at: row.created_at,
      updated_at: row.updated_at,
      day_key: row.day_key || dayKeySource.split('T')[0],
      display_label: row.display_label || null,
      anchored_at: row.anchored_at || null,
      chain_id: row.chain_id || null,
      edited_from_id: row.edited_from_id || null,
    };
  });
}

function mergeThoughts(local: ThoughtObject[], remote: ThoughtObject[]): ThoughtObject[] {
  const merged = new Map<string, ThoughtObject>();
  
  for (const t of remote) merged.set(t.id, t);
  
  for (const t of local) {
    const existing = merged.get(t.id);
    const localIsNewer = !existing || new Date(t.updated_at) > new Date(existing.updated_at);
    
    if (localIsNewer) {
      merged.set(t.id, t);
    } else if (existing && t.state === 'active' && existing.state === 'anchored') {
      merged.set(t.id, { ...existing, state: 'active' });
    }
    
    const final = merged.get(t.id)!;
    if (!final.day_key) {
      final.day_key = (final.anchored_at || final.created_at).split('T')[0];
    }
  }
  
  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}
