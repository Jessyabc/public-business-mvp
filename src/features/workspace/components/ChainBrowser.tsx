 /**
  * Think Space: Chain Browser
  * 
  * Full-surface view of all chains, ordered by most recent activity.
  * Opens from search icon in bottom nav, same background, no modal.
  */
 
 import { useMemo } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { format } from 'date-fns';
 import { ArrowLeft, GitBranch } from 'lucide-react';
 import { useChainStore } from '../stores/chainStore';
 import { useFeedStore } from '../stores/feedStore';
 import { useWorkspaceStore } from '../useWorkspaceStore';
 import { cn } from '@/lib/utils';
 
 // PB Blue - active cognition color
 const PB_BLUE = '#489FE3';
 
 interface ChainBrowserProps {
   isOpen: boolean;
   onClose: () => void;
 }
 
 export function ChainBrowser({ isOpen, onClose }: ChainBrowserProps) {
   const { chains, activeChainId, setActiveChain } = useChainStore();
   const { viewChain, viewGlobal, scope, focusedChainId } = useFeedStore();
   const { thoughts } = useWorkspaceStore();
   
   // Get chains with their most recent thought time, sorted by recency
   const chainsWithActivity = useMemo(() => {
     return chains
       .map((chain) => {
         const chainThoughts = thoughts.filter(
           (t) => t.chain_id === chain.id && t.state === 'anchored'
         );
         const latestThought = chainThoughts.sort((a, b) => {
           const timeA = new Date(a.anchored_at || a.created_at).getTime();
           const timeB = new Date(b.anchored_at || b.created_at).getTime();
           return timeB - timeA;
         })[0];
         
         const firstThought = chainThoughts.sort((a, b) => {
           const timeA = new Date(a.anchored_at || a.created_at).getTime();
           const timeB = new Date(b.anchored_at || b.created_at).getTime();
           return timeA - timeB;
         })[0];
         
         return {
           ...chain,
           thoughtCount: chainThoughts.length,
           latestTime: latestThought 
             ? new Date(latestThought.anchored_at || latestThought.created_at).getTime()
             : new Date(chain.created_at).getTime(),
           firstThoughtPreview: firstThought?.content?.slice(0, 80) || null,
           latestThoughtPreview: latestThought?.content?.slice(0, 80) || null,
         };
       })
       .filter((chain) => chain.thoughtCount > 0) // Only show chains with thoughts
       .sort((a, b) => b.latestTime - a.latestTime);
   }, [chains, thoughts]);
   
   // Handle selecting a chain
   const handleSelectChain = (chainId: string) => {
     setActiveChain(chainId);
     viewChain(chainId);
     onClose();
   };
   
   // Handle going back to global view
   const handleBackToGlobal = () => {
     viewGlobal();
     onClose();
   };
   
   // Check if currently viewing a specific chain
   const isViewingChain = scope === 'chain' && focusedChainId;
   
   return (
     <AnimatePresence>
       {isOpen && (
         <motion.div
           className="fixed inset-0 z-40 overflow-hidden"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.2 }}
         >
           {/* Same background as workspace */}
           <div 
             className="absolute inset-0"
             style={{ background: '#F5F1EC' }}
           />
           
           {/* Content */}
           <div className="relative h-full overflow-y-auto pb-32 pt-8 px-4">
             <div className="max-w-2xl mx-auto">
               {/* Header */}
               <div className="flex items-center justify-between mb-6">
                 <h2 
                   className="text-lg font-medium"
                   style={{ color: '#5D554D' }}
                 >
                   Your Chains
                 </h2>
                 
                 {isViewingChain && (
                   <button
                     onClick={handleBackToGlobal}
                     className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
                     style={{ 
                       color: PB_BLUE,
                       background: `${PB_BLUE}10`,
                     }}
                   >
                     <ArrowLeft className="w-4 h-4" />
                     Back to All
                   </button>
                 )}
               </div>
               
               {/* Chain list */}
               <div className="space-y-3">
                 {chainsWithActivity.length === 0 ? (
                   <div 
                     className="text-center py-12 text-sm"
                     style={{ color: '#A09890' }}
                   >
                     No chains yet. Start thinking to create your first chain.
                   </div>
                 ) : (
                   chainsWithActivity.map((chain, index) => {
                     const isActive = activeChainId === chain.id;
                     const isFocused = focusedChainId === chain.id;
                     const displayLabel = chain.display_label || 
                       format(new Date(chain.first_thought_at || chain.created_at), 'MMM d, h:mm a');
                     
                     return (
                       <motion.button
                         key={chain.id}
                         onClick={() => handleSelectChain(chain.id)}
                         className={cn(
                           "w-full text-left p-4 rounded-2xl transition-all",
                           "hover:shadow-md"
                         )}
                         style={{
                           background: isFocused 
                             ? `linear-gradient(135deg, ${PB_BLUE}15, ${PB_BLUE}08)`
                             : '#EAE5E0',
                           border: isFocused 
                             ? `1px solid ${PB_BLUE}40`
                             : '1px solid transparent',
                           boxShadow: `
                             inset 2px 2px 4px rgba(255, 255, 255, 0.5),
                             inset -2px -2px 4px rgba(180, 165, 145, 0.1)
                           `,
                         }}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: index * 0.03 }}
                         whileHover={{ scale: 1.01 }}
                         whileTap={{ scale: 0.99 }}
                       >
                         <div className="flex items-start justify-between gap-3">
                           <div className="flex-1 min-w-0">
                             {/* Chain label */}
                             <div className="flex items-center gap-2 mb-1">
                               <GitBranch 
                                 className="w-4 h-4 flex-shrink-0" 
                                 style={{ color: isActive ? PB_BLUE : '#A09890' }}
                               />
                               <span 
                                 className="font-medium text-sm truncate"
                                 style={{ color: isActive ? PB_BLUE : '#5D554D' }}
                               >
                                 {displayLabel}
                               </span>
                               {isActive && (
                                 <span 
                                   className="text-[10px] px-1.5 py-0.5 rounded-full"
                                   style={{ 
                                     background: `${PB_BLUE}20`,
                                     color: PB_BLUE,
                                   }}
                                 >
                                   active
                                 </span>
                               )}
                             </div>
                             
                             {/* Preview text */}
                             {chain.latestThoughtPreview && (
                               <p 
                                 className="text-sm line-clamp-2 mt-1"
                                 style={{ color: '#7A7168' }}
                               >
                                 {chain.latestThoughtPreview}
                                 {chain.latestThoughtPreview.length >= 80 && '...'}
                               </p>
                             )}
                             
                             {/* Meta info */}
                             <div 
                               className="flex items-center gap-3 mt-2 text-xs"
                               style={{ color: '#A09890' }}
                             >
                               <span>{chain.thoughtCount} thought{chain.thoughtCount !== 1 ? 's' : ''}</span>
                               <span>·</span>
                               <span>{format(new Date(chain.latestTime), 'MMM d, h:mm a')}</span>
                             </div>
                           </div>
                         </div>
                       </motion.button>
                     );
                   })
                 )}
               </div>
             </div>
           </div>
           
           {/* Tap outside to close - subtle overlay at bottom */}
           <motion.div
             className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
             style={{
               background: 'linear-gradient(to top, #F5F1EC, transparent)',
             }}
           />
         </motion.div>
       )}
     </AnimatePresence>
   );
 }