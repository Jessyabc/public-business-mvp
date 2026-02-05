 /**
  * Think Space: Link Panel Component
  * 
  * Inline panel (not modal) for creating/managing links between chains.
  * Shows available chains to link to and existing links.
  * 
  * Appears inline below the chain marker when triggered.
  */
 
 import { useState, useCallback, useMemo } from 'react';
 import { motion } from 'framer-motion';
 import { Link2, X, Check, Unlink } from 'lucide-react';
 import { useChainStore } from '../stores/chainStore';
 import { useLinkSync } from '../hooks/useLinkSync';
 import { useWorkspaceStore } from '../useWorkspaceStore';
 import { cn } from '@/lib/utils';
 import { format, parseISO } from 'date-fns';
 
 const PB_BLUE = '#489FE3';
 
 interface LinkPanelProps {
   chainId: string;
   onClose: () => void;
 }
 
 /**
  * Get a preview label for a chain based on its first thought
  */
 function getChainPreview(chainId: string, thoughts: ReturnType<typeof useWorkspaceStore.getState>['thoughts']): string {
   const chainThoughts = thoughts
    .filter(t => t.chain_id === chainId && t.anchored_at)
     .sort((a, b) => {
       const timeA = new Date(a.anchored_at || a.created_at).getTime();
       const timeB = new Date(b.anchored_at || b.created_at).getTime();
       return timeA - timeB; // Oldest first
     });
   
   if (chainThoughts.length === 0) return 'Empty chain';
   
   const firstThought = chainThoughts[0];
   const preview = firstThought.content.slice(0, 50);
   return preview.length < firstThought.content.length ? `${preview}...` : preview;
 }
 
 export function LinkPanel({ chainId, onClose }: LinkPanelProps) {
   const { chains } = useChainStore();
   const { thoughts } = useWorkspaceStore();
   const { createLink, deleteLink, getLinksForChain } = useLinkSync();
   const [isCreating, setIsCreating] = useState(false);
 
   // Get existing links for this chain
   const existingLinks = useMemo(() => getLinksForChain(chainId), [chainId, getLinksForChain]);
 
   // Get linked chain IDs (in either direction)
   const linkedChainIds = useMemo(() => {
     return new Set(existingLinks.flatMap(l => [l.from_chain_id, l.to_chain_id]));
   }, [existingLinks]);
 
   // Get available chains to link to (not already linked, not self)
   const availableChains = useMemo(() => {
     return chains.filter(c => 
       c.id !== chainId && 
      !linkedChainIds.has(c.id)
     );
  }, [chains, chainId, linkedChainIds]);
 
   // Get linked chains (for display)
   const linkedChains = useMemo(() => {
     return existingLinks.map(link => {
       const otherId = link.from_chain_id === chainId ? link.to_chain_id : link.from_chain_id;
       const chain = chains.find(c => c.id === otherId);
       return { link, chain };
     }).filter(({ chain }) => chain !== undefined);
   }, [existingLinks, chainId, chains]);
 
   const handleCreateLink = useCallback(async (toChainId: string) => {
     setIsCreating(true);
     await createLink(chainId, toChainId);
     setIsCreating(false);
   }, [chainId, createLink]);
 
   const handleDeleteLink = useCallback(async (linkId: string) => {
     await deleteLink(linkId);
   }, [deleteLink]);
 
   return (
     <motion.div
       initial={{ opacity: 0, height: 0 }}
       animate={{ opacity: 1, height: 'auto' }}
       exit={{ opacity: 0, height: 0 }}
       transition={{ duration: 0.2, ease: 'easeOut' }}
       className="link-panel overflow-hidden"
     >
       <div 
         className="rounded-xl p-4 my-3"
         style={{
           background: 'rgba(234, 229, 224, 0.8)',
           border: `1px solid ${PB_BLUE}20`,
           boxShadow: `0 4px 12px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)`,
         }}
       >
         {/* Header */}
         <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-2">
             <Link2 size={14} style={{ color: PB_BLUE }} />
             <span className="text-sm font-medium" style={{ color: '#4A443D' }}>
               Chain Links
             </span>
           </div>
           <button
             onClick={onClose}
             className="p-1 rounded-md hover:bg-black/5 transition-colors"
           >
             <X size={14} style={{ color: '#6B635B' }} />
           </button>
         </div>
 
         {/* Existing Links */}
         {linkedChains.length > 0 && (
           <div className="mb-4">
             <div className="text-xs text-[#6B635B]/60 mb-2">Linked to:</div>
             <div className="space-y-2">
               {linkedChains.map(({ link, chain }) => (
                 <div 
                   key={link.id}
                   className="flex items-center justify-between gap-2 p-2 rounded-lg"
                   style={{ background: 'rgba(255, 255, 255, 0.5)' }}
                 >
                   <div className="flex-1 min-w-0">
                     <div className="text-sm truncate" style={{ color: '#4A443D' }}>
                       {chain?.display_label || getChainPreview(chain!.id, thoughts)}
                     </div>
                     <div className="text-xs opacity-50">
                       {chain?.first_thought_at 
                         ? format(parseISO(chain.first_thought_at), 'MMM d, h:mm a')
                         : 'No thoughts yet'
                       }
                     </div>
                   </div>
                   <button
                     onClick={() => handleDeleteLink(link.id)}
                     className="p-1.5 rounded-md hover:bg-red-100/50 transition-colors"
                     title="Remove link"
                   >
                     <Unlink size={12} className="text-destructive/60" />
                   </button>
                 </div>
               ))}
             </div>
           </div>
         )}
 
         {/* Available Chains to Link */}
         {availableChains.length > 0 ? (
           <div>
             <div className="text-xs text-[#6B635B]/60 mb-2">
               {linkedChains.length > 0 ? 'Link another chain:' : 'Link to a chain:'}
             </div>
             <div className="space-y-2 max-h-48 overflow-y-auto">
               {availableChains.map((chain) => (
                 <button
                   key={chain.id}
                   onClick={() => handleCreateLink(chain.id)}
                   disabled={isCreating}
                   className={cn(
                     "w-full flex items-center justify-between gap-2 p-2 rounded-lg text-left transition-all",
                     "hover:bg-white/70 active:scale-[0.98]",
                     isCreating && "opacity-50 pointer-events-none"
                   )}
                   style={{ background: 'rgba(255, 255, 255, 0.3)' }}
                 >
                   <div className="flex-1 min-w-0">
                     <div className="text-sm truncate" style={{ color: '#4A443D' }}>
                       {chain.display_label || getChainPreview(chain.id, thoughts)}
                     </div>
                     <div className="text-xs opacity-50">
                       {chain.first_thought_at 
                         ? format(parseISO(chain.first_thought_at), 'MMM d, h:mm a')
                         : 'No thoughts yet'
                       }
                     </div>
                   </div>
                   <div 
                     className="p-1.5 rounded-md"
                     style={{ background: `${PB_BLUE}15` }}
                   >
                     <Check size={12} style={{ color: PB_BLUE }} />
                   </div>
                 </button>
               ))}
             </div>
           </div>
         ) : linkedChains.length === 0 ? (
           <div className="text-sm text-center py-4 opacity-50">
             No other chains to link to yet.
             <br />
             Create more chains to start linking!
           </div>
         ) : null}
       </div>
     </motion.div>
   );
 }