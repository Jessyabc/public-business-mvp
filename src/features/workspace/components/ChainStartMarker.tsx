 /**
  * Think Space: ChainStartMarker
  * 
  * Visual marker for the first thought of a chain (anchor-based, not adjacency).
  * Shows chain title (editable) and subtle "NEW CHAIN" indicator.
  */
 
 import { useState, useRef, useEffect, useCallback } from 'react';
 import { useChainStore } from '../stores/chainStore';
 import { useFeedStore } from '../stores/feedStore';
 import { Link2, ChevronRight } from 'lucide-react';
 import { format, parseISO } from 'date-fns';
 import { cn } from '@/lib/utils';
 import type { ThoughtChain } from '../types/chain';
 import type { ThoughtObject } from '../types';
 
 // PB Blue
 const PB_BLUE = '#489FE3';
 
 interface ChainStartMarkerProps {
   chain: ThoughtChain;
   anchorThought: ThoughtObject;
 }
 
 export function ChainStartMarker({ chain, anchorThought }: ChainStartMarkerProps) {
   const { updateChainLabel } = useChainStore();
   const { viewChain, scope, focusedChainId } = useFeedStore();
   const [isEditing, setIsEditing] = useState(false);
   const [titleDraft, setTitleDraft] = useState('');
   const inputRef = useRef<HTMLInputElement>(null);
 
   // Default title: timestamp of anchor thought
   const defaultTitle = format(
     parseISO(anchorThought.anchored_at || anchorThought.created_at),
     'MMM d, h:mm a'
   );
   const displayTitle = chain.display_label || defaultTitle;
   const hasCustomTitle = !!chain.display_label;
 
   // Check if this chain has links (show || indicator)
   const { chainLinks } = useFeedStore();
   const hasLinks = chainLinks.some(
     (l) => l.from_chain_id === chain.id || l.to_chain_id === chain.id
   );
 
   // Start editing
   const handleStartEdit = useCallback((e: React.MouseEvent) => {
     e.stopPropagation();
     setTitleDraft(chain.display_label || '');
     setIsEditing(true);
   }, [chain.display_label]);
 
   // Save title
   const handleSave = useCallback(() => {
     const trimmed = titleDraft.trim();
     updateChainLabel(chain.id, trimmed === '' ? null : trimmed);
     setIsEditing(false);
   }, [titleDraft, chain.id, updateChainLabel]);
 
   // Cancel editing
   const handleCancel = useCallback(() => {
     setIsEditing(false);
     setTitleDraft('');
   }, []);
 
   // Handle key events
   const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
     e.stopPropagation();
     if (e.key === 'Enter') handleSave();
     else if (e.key === 'Escape') handleCancel();
   }, [handleSave, handleCancel]);
 
   // Focus input when editing
   useEffect(() => {
     if (isEditing && inputRef.current) {
       inputRef.current.focus();
       inputRef.current.select();
     }
   }, [isEditing]);
 
   // Handle click on chain title to focus chain view
   const handleChainFocus = useCallback(() => {
     if (scope !== 'chain' || focusedChainId !== chain.id) {
       viewChain(chain.id);
     }
   }, [scope, focusedChainId, chain.id, viewChain]);
 
   // Handle link indicator click to view merged
   const handleViewMerged = useCallback((e: React.MouseEvent) => {
     e.stopPropagation();
     const { viewMerged } = useFeedStore.getState();
     viewMerged(chain.id);
   }, [chain.id]);
 
   return (
     <div className="chain-start-marker py-4">
       <div className="flex items-center gap-3">
         {/* Broken line + NEW CHAIN label */}
         <div 
           className="flex-1 h-px"
           style={{ 
             background: `linear-gradient(to right, transparent, ${PB_BLUE}30, ${PB_BLUE}30)` 
           }}
         />
 
         {/* Chain title (editable) */}
         <div className="flex items-center gap-2">
           {isEditing ? (
             <input
               ref={inputRef}
               type="text"
               value={titleDraft}
               onChange={(e) => setTitleDraft(e.target.value)}
               onBlur={handleSave}
               onKeyDown={handleKeyDown}
               className="bg-transparent border-none outline-none text-xs font-medium min-w-[80px]"
               style={{ color: PB_BLUE }}
               placeholder={defaultTitle}
             />
           ) : (
             <button
               onClick={handleStartEdit}
               onDoubleClick={handleChainFocus}
               className={cn(
                 "px-3 py-1 rounded-full text-xs font-medium",
                 "transition-all duration-200 hover:opacity-80",
                 "flex items-center gap-1"
               )}
               style={{ 
                 color: PB_BLUE,
                 background: `${PB_BLUE}10`,
                 border: `1px solid ${PB_BLUE}20`
               }}
               title="Click to edit title, double-click to focus chain"
             >
               <span>{displayTitle}</span>
               {hasCustomTitle && (
                 <span className="opacity-50 text-[10px]">
                   ({format(parseISO(anchorThought.anchored_at || anchorThought.created_at), 'h:mm a')})
                 </span>
               )}
             </button>
           )}
 
           {/* Link indicator || - only show if chain has links */}
           {hasLinks && (
             <button
               onClick={handleViewMerged}
               className="flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity px-1.5 py-1 rounded"
               style={{ color: PB_BLUE }}
               title="View merged chains"
             >
               <span className="text-sm font-bold">||</span>
             </button>
           )}
 
           {/* Focus chain indicator */}
           {scope === 'global' && (
             <button
               onClick={handleChainFocus}
               className="opacity-40 hover:opacity-80 transition-opacity"
               title="Focus this chain"
             >
               <ChevronRight className="w-3 h-3" style={{ color: PB_BLUE }} />
             </button>
           )}
         </div>
 
         <div 
           className="flex-1 h-px"
           style={{ 
             background: `linear-gradient(to left, transparent, ${PB_BLUE}30, ${PB_BLUE}30)` 
           }}
         />
       </div>
     </div>
   );
 }