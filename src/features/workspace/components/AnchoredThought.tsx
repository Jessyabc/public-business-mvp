/**
 * Pillar #1: Anchored Thought Entry
 * 
 * A single thought entry within a day thread.
 * Shows timestamp, content, and delete action.
 * Click to reactivate and continue editing.
 */

import { useCallback } from 'react';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { useChainStore } from '../stores/chainStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

// PB Blue for chain indicators
const PB_BLUE = '#489FE3';

interface AnchoredThoughtProps {
  thoughtId: string;
  depth?: number; // position in the day thread (0 = most recent)
}

/**
 * Format time for display within a day (just the time)
 */
function formatTime(isoString: string): string {
  return format(parseISO(isoString), 'h:mm a');
}

export function AnchoredThought({ thoughtId, depth = 0 }: AnchoredThoughtProps) {
  const { thoughts, reactivateThought, deleteThought } = useWorkspaceStore();
  const { activeChainId } = useChainStore();
  const { user } = useAuth();
  
  const thought = thoughts.find((t) => t.id === thoughtId);
  
  // Check if this thought belongs to the active chain
  const isInActiveChain = thought?.chain_id === activeChainId;

  const handleClick = useCallback(() => {
    reactivateThought(thoughtId);
  }, [thoughtId, reactivateThought]);

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Delete from local store first (optimistic)
    deleteThought(thoughtId);
    
    // Delete from Supabase
    if (user) {
      try {
        await supabase
          .from('workspace_thoughts')
          .delete()
          .eq('id', thoughtId)
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to delete thought from database:', err);
      }
    }
  }, [thoughtId, deleteThought, user]);

  if (!thought) return null;

  const timeString = formatTime(thought.anchored_at || thought.created_at);

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={cn(
        "anchored-thought group",
        "relative w-full cursor-pointer",
        "transition-all duration-200 ease-out",
        "hover:translate-x-1"
      )}
    >
      <div className="flex gap-3">
        {/* Time marker + chain indicator */}
        <div 
          className="shrink-0 pt-0.5 text-xs w-16 text-right flex flex-col items-end gap-1"
          style={{ color: '#A89F95' }}
        >
          {timeString}
          {/* Chain indicator for thoughts not in active chain */}
          {!isInActiveChain && thought.chain_id && (
            <div 
              className="flex items-center gap-0.5 opacity-60"
              title="Tap to switch to this chain"
            >
              <GitBranch className="w-3 h-3" style={{ color: PB_BLUE }} />
            </div>
          )}
        </div>
        
        {/* Content - with visual differentiation for inactive chain */}
        <div 
          className={cn(
            "flex-1 relative rounded-xl p-4 transition-all duration-200",
            !isInActiveChain && "opacity-75"
          )}
          style={{
            background: isInActiveChain ? '#F5F0EB' : '#F0EBE6',
            boxShadow: isInActiveChain
              ? `3px 3px 8px rgba(180, 165, 145, 0.15), -3px -3px 8px rgba(255, 255, 255, 0.7)`
              : `2px 2px 5px rgba(180, 165, 145, 0.1), -2px -2px 5px rgba(255, 255, 255, 0.5)`,
            // Subtle left border for inactive chain thoughts
            borderLeft: !isInActiveChain ? `2px solid ${PB_BLUE}30` : undefined,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isInActiveChain ? '#F7F2ED' : '#F5F0EB';
            e.currentTarget.style.boxShadow = isInActiveChain
              ? `4px 4px 10px rgba(180, 165, 145, 0.2), -4px -4px 10px rgba(255, 255, 255, 0.8)`
              : `3px 3px 8px rgba(180, 165, 145, 0.15), -3px -3px 8px rgba(255, 255, 255, 0.7)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isInActiveChain ? '#F5F0EB' : '#F0EBE6';
            e.currentTarget.style.boxShadow = isInActiveChain
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
          
          {/* Delete on hover */}
          <button
            onClick={handleDelete}
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-lg",
              "opacity-0 group-hover:opacity-60",
              "hover:opacity-100",
              "transition-all duration-200"
            )}
            style={{ color: '#9B9590' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#C75050';
              e.currentTarget.style.background = 'rgba(199, 80, 80, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9B9590';
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Delete thought"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
