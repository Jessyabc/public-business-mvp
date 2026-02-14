 /**
  * Think Space: ThoughtCard
  * 
  * Individual thought display within the ThinkFeed.
  * Adapted from AnchoredThought with feed-specific features.
  */
 
import { useCallback, useState } from 'react';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { useChainStore } from '../stores/chainStore';
import { useFeedStore } from '../stores/feedStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Trash2, GitBranch, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
 import { format, parseISO } from 'date-fns';
 import type { ThoughtObject } from '../types';
 
 // PB Blue for chain indicators
 const PB_BLUE = '#489FE3';
 
 interface ThoughtCardProps {
   thought: ThoughtObject;
   isEditable?: boolean;
 }
 
 /**
  * Format time for display
  */
 function formatTime(isoString: string): string {
   return format(parseISO(isoString), 'h:mm a');
 }
 
 export function ThoughtCard({ thought, isEditable = false }: ThoughtCardProps) {
   const { reactivateThought, deleteThought } = useWorkspaceStore();
   const { activeChainId } = useChainStore();
   const { viewChain, scope } = useFeedStore();
  const { user } = useAuth();
  const isMobile = useIsMobile();
    
  // Check if this thought belongs to the active chain
   const isInActiveChain = thought.chain_id === activeChainId;
   
   // Check if this is an edited thought
   const isEdited = !!thought.edited_from_id;
 
   const handleClick = useCallback(() => {
     if (!isEditable) return; // Only latest thoughts are editable
     reactivateThought(thought.id);
   }, [thought.id, reactivateThought, isEditable]);
 
   // Tap on chain indicator to focus that chain
   const handleChainFocus = useCallback((e: React.MouseEvent) => {
     e.stopPropagation();
     if (thought.chain_id) {
       viewChain(thought.chain_id);
     }
   }, [thought.chain_id, viewChain]);
 
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteRequest = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
    
    // Delete from local store first (optimistic)
    deleteThought(thought.id);
    
    // Delete from Supabase
    if (user) {
      try {
        await supabase
          .from('workspace_thoughts')
          .delete()
          .eq('id', thought.id)
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to delete thought from database:', err);
      }
    }
  }, [thought.id, deleteThought, user]);

  const handleDeleteCancel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  }, []);
 
   const timeString = formatTime(thought.anchored_at || thought.created_at);
 
   return (
     <div
       onClick={handleClick}
       role="button"
       tabIndex={0}
       onKeyDown={(e) => e.key === 'Enter' && handleClick()}
       className={cn(
         "thought-card group",
         "relative w-full py-3",
         "transition-all duration-200 ease-out",
         isEditable ? "cursor-pointer hover:translate-x-1" : "cursor-default"
       )}
     >
       <div className="flex gap-3">
         {/* Time marker + chain indicator */}
         <div 
           className="shrink-0 pt-0.5 text-xs w-16 text-right flex flex-col items-end gap-1"
           style={{ color: '#A89F95' }}
         >
           {timeString}
           {/* Chain indicator for thoughts not in active chain (in global view) */}
           {scope === 'global' && !isInActiveChain && thought.chain_id && (
             <button
               onClick={handleChainFocus}
               className="flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity"
               title="Tap to view this chain"
             >
               <GitBranch className="w-3 h-3" style={{ color: PB_BLUE }} />
             </button>
           )}
           {/* Edit indicator */}
           {isEdited && (
             <span className="flex items-center gap-0.5 opacity-50" title="Edited">
               <Edit3 className="w-2.5 h-2.5" style={{ color: '#9A8F85' }} />
             </span>
           )}
         </div>
         
         {/* Content - with visual differentiation for inactive chain */}
         <div 
           className={cn(
             "flex-1 relative rounded-xl p-4 transition-all duration-200",
             !isInActiveChain && scope === 'global' && "opacity-75"
           )}
           style={{
             background: isInActiveChain || scope !== 'global' ? '#F5F0EB' : '#F0EBE6',
             boxShadow: isInActiveChain || scope !== 'global'
               ? `3px 3px 8px rgba(180, 165, 145, 0.15), -3px -3px 8px rgba(255, 255, 255, 0.7)`
               : `2px 2px 5px rgba(180, 165, 145, 0.1), -2px -2px 5px rgba(255, 255, 255, 0.5)`,
             // Subtle left border for inactive chain thoughts in global view
             borderLeft: !isInActiveChain && scope === 'global' ? `2px solid ${PB_BLUE}30` : undefined,
           }}
           onMouseEnter={(e) => {
             e.currentTarget.style.background = '#F7F2ED';
             e.currentTarget.style.boxShadow = `4px 4px 10px rgba(180, 165, 145, 0.2), -4px -4px 10px rgba(255, 255, 255, 0.8)`;
           }}
           onMouseLeave={(e) => {
             e.currentTarget.style.background = isInActiveChain || scope !== 'global' ? '#F5F0EB' : '#F0EBE6';
             e.currentTarget.style.boxShadow = isInActiveChain || scope !== 'global'
               ? `3px 3px 8px rgba(180, 165, 145, 0.15), -3px -3px 8px rgba(255, 255, 255, 0.7)`
               : `2px 2px 5px rgba(180, 165, 145, 0.1), -2px -2px 5px rgba(255, 255, 255, 0.5)`;
           }}
         >
           <p 
             className="text-base leading-relaxed whitespace-pre-wrap break-words"
             style={{ color: '#3D3833' }}
           >
             {thought.content}
           </p>
           
            {/* Delete button - visible on hover (desktop) or always subtle (mobile) */}
            {!showDeleteConfirm ? (
              <button
                onClick={handleDeleteRequest}
                className={cn(
                  "absolute top-2 right-2 p-1.5 rounded-lg",
                  "transition-all duration-200",
                  isMobile 
                    ? "opacity-40 active:opacity-100" 
                    : "opacity-0 group-hover:opacity-60 hover:opacity-100"
                )}
                style={{ color: '#9B9590' }}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.color = '#C75050';
                    e.currentTarget.style.background = 'rgba(199, 80, 80, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.color = '#9B9590';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
                aria-label="Delete thought"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div 
                className="absolute top-1 right-1 flex items-center gap-1 p-1 rounded-lg z-20"
                style={{ background: 'rgba(245, 240, 235, 0.95)' }}
              >
                <span className="text-xs px-1" style={{ color: '#6B635B' }}>Delete?</span>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-2 py-1 rounded text-xs font-medium transition-colors"
                  style={{ background: 'rgba(199, 80, 80, 0.15)', color: '#C75050' }}
                >
                  Yes
                </button>
                <button
                  onClick={handleDeleteCancel}
                  className="px-2 py-1 rounded text-xs transition-colors"
                  style={{ color: '#6B635B' }}
                >
                  No
                </button>
              </div>
            )}
         </div>
       </div>
     </div>
   );
 }