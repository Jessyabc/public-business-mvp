/**
 * Think Space: Chain Sync Hook
 * 
 * Syncs thought_chains and active_chain_id with Supabase.
 * Active chain is ACCOUNT-LEVEL (persisted to user_settings.active_chain_id).
 * DB is source of truth — replaces local state on load.
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
    activeChainId,
    setChains,
    setActiveChain,
    setLoadingChains,
    setSyncingChains,
  } = useChainStore();
  
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeChainSyncRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const lastSyncedChainsRef = useRef<string>('');
  const lastSyncedActiveChainRef = useRef<string | null>(null);

  // Load active_chain_id from user_settings
  const loadActiveChain = useCallback(async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('active_chain_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.active_chain_id ?? null;
    } catch (err) {
      console.error('Failed to load active chain:', err);
      return null;
    }
  }, [user]);

  // Persist active_chain_id to user_settings
  const persistActiveChain = useCallback(async (chainId: string | null) => {
    if (!user) return;
    if (chainId === lastSyncedActiveChainRef.current) return;
    
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          active_chain_id: chainId,
        }, { onConflict: 'user_id' });

      if (error) throw error;
      lastSyncedActiveChainRef.current = chainId;
    } catch (err) {
      console.error('Failed to persist active chain:', err);
    }
  }, [user]);

  const debouncedActiveChainSync = useCallback((chainId: string | null) => {
    if (activeChainSyncRef.current) clearTimeout(activeChainSyncRef.current);
    activeChainSyncRef.current = setTimeout(() => {
      persistActiveChain(chainId);
    }, 500);
  }, [persistActiveChain]);

  // Load chains — DB is source of truth
  const loadChains = useCallback(async () => {
    if (!user) {
      setLoadingChains(false);
      return;
    }
    
    setLoadingChains(true);
    
    try {
      const [chainsResult, activeChainId] = await Promise.all([
        supabase
          .from('thought_chains')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        loadActiveChain(),
      ]);

      if (chainsResult.error) throw chainsResult.error;
      
      if (chainsResult.data && isMountedRef.current) {
        const loadedChains: ThoughtChain[] = chainsResult.data.map((row) => ({
          id: row.id,
          user_id: row.user_id,
          created_at: row.created_at,
          first_thought_at: row.first_thought_at,
          display_label: row.display_label,
          updated_at: row.updated_at,
          diverged_from_chain_id: row.diverged_from_chain_id,
          diverged_at_thought_id: row.diverged_at_thought_id,
        }));
        
        // DB is source of truth — replace local state
        setChains(loadedChains);
        lastSyncedChainsRef.current = JSON.stringify(loadedChains);
        
        if (activeChainId && loadedChains.some(c => c.id === activeChainId)) {
          setActiveChain(activeChainId);
          lastSyncedActiveChainRef.current = activeChainId;
        }
      }
    } catch (err) {
      console.error('Failed to load chains:', err);
    } finally {
      setLoadingChains(false);
    }
  }, [user, setChains, setActiveChain, setLoadingChains, loadActiveChain]);

  // Sync chains to Supabase
  const syncChains = useCallback(async () => {
    if (!user) return;
    
    const currentChains = useChainStore.getState().chains;
    const currentJson = JSON.stringify(currentChains);
    
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
        diverged_from_chain_id: c.diverged_from_chain_id ?? null,
        diverged_at_thought_id: c.diverged_at_thought_id ?? null,
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
      if (isMountedRef.current) setSyncingChains(false);
    }
  }, [user, setSyncingChains]);

  const debouncedSync = useCallback(() => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(syncChains, SYNC_DEBOUNCE_MS);
  }, [syncChains]);

  // Load on mount
  useEffect(() => {
    isMountedRef.current = true;
    if (user) loadChains();
    else setLoadingChains(false);
    
    return () => {
      isMountedRef.current = false;
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      if (activeChainSyncRef.current) clearTimeout(activeChainSyncRef.current);
    };
  }, [user, loadChains, setLoadingChains]);

  // Auto-sync when chains change
  useEffect(() => {
    if (user && chains.length > 0) debouncedSync();
  }, [chains, user, debouncedSync]);

  // Persist active chain when it changes
  useEffect(() => {
    if (user && activeChainId !== undefined) {
      debouncedActiveChainSync(activeChainId);
    }
  }, [activeChainId, user, debouncedActiveChainSync]);

  return { loadChains, syncChains, persistActiveChain };
}
