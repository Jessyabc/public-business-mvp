 /**
  * Think Space: Chain Links Sync Hook
  * 
  * Syncs chain_links between local feedStore and Supabase.
  * Handles load on mount + realtime subscriptions.
  */
 
 import { useEffect, useRef, useCallback } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useFeedStore } from '../stores/feedStore';
 import { useAuth } from '@/contexts/AuthContext';
 import type { ChainLink } from '../types';
 
 export function useLinkSync() {
   const { user } = useAuth();
   const { chainLinks, setChainLinks, addChainLink, removeChainLink } = useFeedStore();
   const hasLoadedRef = useRef(false);
   const isSyncingRef = useRef(false);
 
   // Load chain links from Supabase on mount
   useEffect(() => {
     if (!user?.id || hasLoadedRef.current) return;
 
     const loadLinks = async () => {
       try {
         const { data, error } = await supabase
           .from('chain_links')
           .select('*')
           .eq('user_id', user.id)
           .order('created_at', { ascending: false });
 
         if (error) {
           console.error('Error loading chain links:', error);
           return;
         }
 
         if (data) {
           setChainLinks(data as ChainLink[]);
           hasLoadedRef.current = true;
         }
       } catch (err) {
         console.error('Error loading chain links:', err);
       }
     };
 
     loadLinks();
   }, [user?.id, setChainLinks]);
 
   // Realtime subscription for chain_links
   useEffect(() => {
     if (!user?.id) return;
 
     const channel = supabase
       .channel('chain-links-changes')
       .on(
         'postgres_changes',
         {
           event: '*',
           schema: 'public',
           table: 'chain_links',
           filter: `user_id=eq.${user.id}`,
         },
         (payload) => {
           // Skip if we're the ones syncing
           if (isSyncingRef.current) return;
 
           if (payload.eventType === 'INSERT') {
             const newLink = payload.new as ChainLink;
             // Check if we already have this link
             const exists = useFeedStore.getState().chainLinks.some(l => l.id === newLink.id);
             if (!exists) {
               addChainLink(newLink);
             }
           } else if (payload.eventType === 'DELETE') {
             const deletedId = (payload.old as { id: string }).id;
             removeChainLink(deletedId);
           }
         }
       )
       .subscribe();
 
     return () => {
       supabase.removeChannel(channel);
     };
   }, [user?.id, addChainLink, removeChainLink]);
 
   // Create a new chain link
   const createLink = useCallback(async (fromChainId: string, toChainId: string): Promise<ChainLink | null> => {
     if (!user?.id) return null;
     if (fromChainId === toChainId) return null;
 
     // Check if link already exists (in either direction)
     const existingLinks = useFeedStore.getState().chainLinks;
     const exists = existingLinks.some(
       l => (l.from_chain_id === fromChainId && l.to_chain_id === toChainId) ||
            (l.from_chain_id === toChainId && l.to_chain_id === fromChainId)
     );
     if (exists) {
       console.log('Link already exists');
       return null;
     }
 
     isSyncingRef.current = true;
 
     try {
       const { data, error } = await supabase
         .from('chain_links')
         .insert({
           user_id: user.id,
           from_chain_id: fromChainId,
           to_chain_id: toChainId,
         })
         .select()
         .single();
 
       if (error) {
         console.error('Error creating chain link:', error);
         return null;
       }
 
       const newLink = data as ChainLink;
       addChainLink(newLink);
       return newLink;
     } catch (err) {
       console.error('Error creating chain link:', err);
       return null;
     } finally {
       isSyncingRef.current = false;
     }
   }, [user?.id, addChainLink]);
 
   // Delete a chain link
   const deleteLink = useCallback(async (linkId: string): Promise<boolean> => {
     if (!user?.id) return false;
 
     isSyncingRef.current = true;
 
     try {
       const { error } = await supabase
         .from('chain_links')
         .delete()
         .eq('id', linkId)
         .eq('user_id', user.id);
 
       if (error) {
         console.error('Error deleting chain link:', error);
         return false;
       }
 
       removeChainLink(linkId);
       return true;
     } catch (err) {
       console.error('Error deleting chain link:', err);
       return false;
     } finally {
       isSyncingRef.current = false;
     }
   }, [user?.id, removeChainLink]);
 
   // Get links for a specific chain
   const getLinksForChain = useCallback((chainId: string) => {
     return chainLinks.filter(
       l => l.from_chain_id === chainId || l.to_chain_id === chainId
     );
   }, [chainLinks]);
 
   return {
     chainLinks,
     createLink,
     deleteLink,
     getLinksForChain,
   };
 }