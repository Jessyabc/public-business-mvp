/**
 * Think Space: Realtime Sync Hook
 * 
 * Subscribes to Supabase realtime changes for:
 * - workspace_thoughts
 * - thought_chains
 * - chain_links
 * 
 * Server is authoritative. Deduplicates optimistic inserts by ID.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { useChainStore } from '../stores/chainStore';
import type { ThoughtObject } from '../types';
import type { ThoughtChain } from '../types/chain';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Debounce to prevent rapid re-renders from multiple events
const DEBOUNCE_MS = 100;

export function useRealtimeSync() {
  const { user } = useAuth();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Map<string, 'thought' | 'chain'>>(new Map());
  const [isConnected, setIsConnected] = useState(true);
  
  // Get store actions
  const { thoughts, setThoughts } = useWorkspaceStore();
  const { chains, setChains, setActiveChain } = useChainStore();
  
  // Process batched updates
  const processPendingUpdates = useCallback(() => {
    // Updates are already applied individually, this is just for cleanup
    pendingUpdatesRef.current.clear();
  }, []);
  
  // Debounced batch processor
  const scheduleBatchProcess = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(processPendingUpdates, DEBOUNCE_MS);
  }, [processPendingUpdates]);

  // Handle thought INSERT
  const handleThoughtInsert = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    const newRow = payload.new as any;
    if (!newRow) return;
    
    const currentThoughts = useWorkspaceStore.getState().thoughts;
    
    // Check if thought already exists (optimistic insert)
    if (currentThoughts.some(t => t.id === newRow.id)) {
      return; // Already have this thought
    }
    
    const newThought: ThoughtObject = {
      id: newRow.id,
      user_id: newRow.user_id,
      content: newRow.content,
      state: newRow.state === 'active' ? 'active' : 'anchored',
      created_at: newRow.created_at,
      updated_at: newRow.updated_at,
      anchored_at: newRow.anchored_at || null,
      day_key: newRow.day_key || newRow.created_at.split('T')[0],
      display_label: newRow.display_label || null,
      chain_id: newRow.chain_id || null,
      edited_from_id: newRow.edited_from_id || null,
    };
    
    setThoughts([newThought, ...currentThoughts]);
    pendingUpdatesRef.current.set(newRow.id, 'thought');
    scheduleBatchProcess();
  }, [setThoughts, scheduleBatchProcess]);

  // Handle thought UPDATE
  const handleThoughtUpdate = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    const updatedRow = payload.new as any;
    if (!updatedRow) return;
    
    const currentThoughts = useWorkspaceStore.getState().thoughts;
    const existingIndex = currentThoughts.findIndex(t => t.id === updatedRow.id);
    
    if (existingIndex === -1) {
      // Thought doesn't exist locally, treat as insert
      handleThoughtInsert(payload);
      return;
    }
    
    const existing = currentThoughts[existingIndex];
    
    // Server wins: use server version if newer
    const serverTime = new Date(updatedRow.updated_at).getTime();
    const localTime = new Date(existing.updated_at).getTime();
    
    if (serverTime >= localTime) {
      const updatedThought: ThoughtObject = {
        ...existing,
        content: updatedRow.content,
        state: updatedRow.state === 'active' ? 'active' : 'anchored',
        updated_at: updatedRow.updated_at,
        anchored_at: updatedRow.anchored_at || null,
        day_key: updatedRow.day_key || existing.day_key,
        display_label: updatedRow.display_label || null,
        chain_id: updatedRow.chain_id || null,
        edited_from_id: updatedRow.edited_from_id || null,
      };
      
      const newThoughts = [...currentThoughts];
      newThoughts[existingIndex] = updatedThought;
      setThoughts(newThoughts);
    }
    
    pendingUpdatesRef.current.set(updatedRow.id, 'thought');
    scheduleBatchProcess();
  }, [setThoughts, handleThoughtInsert, scheduleBatchProcess]);

  // Handle thought DELETE
  const handleThoughtDelete = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    const deletedRow = payload.old as any;
    if (!deletedRow?.id) return;
    
    const currentThoughts = useWorkspaceStore.getState().thoughts;
    const filtered = currentThoughts.filter(t => t.id !== deletedRow.id);
    
    if (filtered.length !== currentThoughts.length) {
      setThoughts(filtered);
    }
    
    scheduleBatchProcess();
  }, [setThoughts, scheduleBatchProcess]);

  // Handle chain INSERT
  const handleChainInsert = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    const newRow = payload.new as any;
    if (!newRow) return;
    
    const currentChains = useChainStore.getState().chains;
    
    // Check if chain already exists
    if (currentChains.some(c => c.id === newRow.id)) {
      return;
    }
    
    const newChain: ThoughtChain = {
      id: newRow.id,
      user_id: newRow.user_id,
      display_label: newRow.display_label || null,
      diverged_from_chain_id: newRow.diverged_from_chain_id || null,
      diverged_at_thought_id: newRow.diverged_at_thought_id || null,
      first_thought_at: newRow.first_thought_at || null,
      created_at: newRow.created_at,
      updated_at: newRow.updated_at,
    };
    
    setChains([...currentChains, newChain]);
    pendingUpdatesRef.current.set(newRow.id, 'chain');
    scheduleBatchProcess();
  }, [setChains, scheduleBatchProcess]);

  // Handle chain UPDATE
  const handleChainUpdate = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    const updatedRow = payload.new as any;
    if (!updatedRow) return;
    
    const currentChains = useChainStore.getState().chains;
    const existingIndex = currentChains.findIndex(c => c.id === updatedRow.id);
    
    if (existingIndex === -1) {
      handleChainInsert(payload);
      return;
    }
    
    const updatedChain: ThoughtChain = {
      ...currentChains[existingIndex],
      display_label: updatedRow.display_label || null,
      diverged_from_chain_id: updatedRow.diverged_from_chain_id || null,
      diverged_at_thought_id: updatedRow.diverged_at_thought_id || null,
      first_thought_at: updatedRow.first_thought_at || null,
      updated_at: updatedRow.updated_at,
    };
    
    const newChains = [...currentChains];
    newChains[existingIndex] = updatedChain;
    setChains(newChains);
    
    pendingUpdatesRef.current.set(updatedRow.id, 'chain');
    scheduleBatchProcess();
  }, [setChains, handleChainInsert, scheduleBatchProcess]);

  // Handle chain DELETE
  const handleChainDelete = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    const deletedRow = payload.old as any;
    if (!deletedRow?.id) return;
    
    const currentChains = useChainStore.getState().chains;
    const filtered = currentChains.filter(c => c.id !== deletedRow.id);
    
    if (filtered.length !== currentChains.length) {
      setChains(filtered);
      
      // If deleted chain was active, clear it
      const activeChainId = useChainStore.getState().activeChainId;
      if (activeChainId === deletedRow.id) {
        setActiveChain(null);
      }
    }
    
    scheduleBatchProcess();
  }, [setChains, setActiveChain, scheduleBatchProcess]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`workspace-realtime-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workspace_thoughts',
          filter: `user_id=eq.${user.id}`,
        },
        handleThoughtInsert
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'workspace_thoughts',
          filter: `user_id=eq.${user.id}`,
        },
        handleThoughtUpdate
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'workspace_thoughts',
          filter: `user_id=eq.${user.id}`,
        },
        handleThoughtDelete
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'thought_chains',
          filter: `user_id=eq.${user.id}`,
        },
        handleChainInsert
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'thought_chains',
          filter: `user_id=eq.${user.id}`,
        },
        handleChainUpdate
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'thought_chains',
          filter: `user_id=eq.${user.id}`,
        },
        handleChainDelete
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Subscribed to workspace changes');
          setIsConnected(true);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Channel error');
          setIsConnected(false);
        } else if (status === 'CLOSED') {
          setIsConnected(false);
        }
      });

    return () => {
      console.log('[Realtime] Unsubscribing from workspace changes');
      channel.unsubscribe();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    user,
    handleThoughtInsert,
    handleThoughtUpdate,
    handleThoughtDelete,
    handleChainInsert,
    handleChainUpdate,
    handleChainDelete,
  ]);

  return {
    isConnected,
  };
}