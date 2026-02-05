 /**
  * Think Space: FeedScopeIndicator
  * 
  * Subtle breadcrumb showing current scope: Global > Chain > Merged
  * Allows widening scope back to global.
  */
 
 import { useCallback } from 'react';
 import { useFeedStore } from '../stores/feedStore';
 import { useChainStore } from '../stores/chainStore';
 import { ChevronRight, Globe, GitBranch, Link2 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 // PB Blue
 const PB_BLUE = '#489FE3';
 
 export function FeedScopeIndicator() {
   const { scope, focusedChainId, viewGlobal, viewChain } = useFeedStore();
   const { getChainById } = useChainStore();
 
   const chain = focusedChainId ? getChainById(focusedChainId) : null;
   const chainTitle = chain?.display_label || 'Chain';
 
   // Handle breadcrumb clicks
   const handleGlobalClick = useCallback(() => {
     viewGlobal();
   }, [viewGlobal]);
 
   const handleChainClick = useCallback(() => {
     if (focusedChainId && scope === 'merged') {
       viewChain(focusedChainId);
     }
   }, [focusedChainId, scope, viewChain]);
 
   return (
     <div className="feed-scope-indicator px-2">
       {/* Only show breadcrumb when not in global view */}
       {scope !== 'global' && (
       <div 
         className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs"
         style={{
           background: 'rgba(255, 255, 255, 0.5)',
           backdropFilter: 'blur(8px)',
           border: '1px solid rgba(255, 255, 255, 0.3)',
         }}
       >
         {/* Global */}
         <button
           onClick={handleGlobalClick}
           className={cn(
             "flex items-center gap-1 px-2 py-0.5 rounded-full transition-all",
             "hover:bg-white/50"
           )}
           style={{ color: '#6B635B' }}
         >
           <Globe className="w-3 h-3" />
           <span>All</span>
         </button>
 
         <ChevronRight className="w-3 h-3 opacity-40" style={{ color: '#6B635B' }} />
 
         {/* Chain */}
         {scope === 'chain' ? (
           <span 
             className="flex items-center gap-1 px-2 py-0.5"
             style={{ color: PB_BLUE }}
           >
             <GitBranch className="w-3 h-3" />
             <span className="font-medium">{chainTitle}</span>
           </span>
         ) : (
           <button
             onClick={handleChainClick}
             className={cn(
               "flex items-center gap-1 px-2 py-0.5 rounded-full transition-all",
               "hover:bg-white/50"
             )}
             style={{ color: '#6B635B' }}
           >
             <GitBranch className="w-3 h-3" />
             <span>{chainTitle}</span>
           </button>
         )}
 
         {/* Merged indicator */}
         {scope === 'merged' && (
           <>
             <ChevronRight className="w-3 h-3 opacity-40" style={{ color: '#6B635B' }} />
             <span 
               className="flex items-center gap-1 px-2 py-0.5"
               style={{ color: PB_BLUE }}
             >
               <Link2 className="w-3 h-3" />
               <span className="font-medium">Merged</span>
             </span>
           </>
         )}
       </div>
       )}
     </div>
   );
 }