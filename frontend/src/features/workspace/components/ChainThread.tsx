/**
 * Think Space: Chain Thread Component
 * 
 * Visual thread connecting thoughts in a chain.
 * Shows the continuation point (OpenCircle) at the end.
 * 
 * Thread line: 2px, PB Blue at 15% opacity
 * Solid for raw chain, dashed for lens boundary
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { OpenCircle } from './OpenCircle';
import { AnchoredThought } from './AnchoredThought';
import { useChainStore } from '../stores/chainStore';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { useAuth } from '@/contexts/AuthContext';

import type { ThoughtChain } from '../types/chain';
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';

// PB Blue for thread
const PB_BLUE = '#489FE3';

interface ChainThreadProps {
  chain: ThoughtChain;
  isActive?: boolean;
  isInLens?: boolean; // If true, show dashed connector
}

/**
 * Format chain header for display
 */
function formatChainHeader(chain: ThoughtChain): string {
  if (chain.display_label) {
    return chain.display_label;
  }
  
  if (!chain.first_thought_at) {
    return 'New Chain';
  }
  
  const date = parseISO(chain.first_thought_at);
  
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'h:mm a')}`;
  }
  if (isThisWeek(date)) {
    return format(date, 'EEEE, h:mm a');
  }
  if (isThisYear(date)) {
    return format(date, 'MMMM d, h:mm a');
  }
  return format(date, 'MMMM d, yyyy');
}

export function ChainThread({ 
  chain, 
  isActive = false,
  isInLens = false,
}: ChainThreadProps) {
  const { user } = useAuth();
  const { thoughts, createThought } = useWorkspaceStore();
  const { breakChain, setActiveChain } = useChainStore();
  
  // Get thoughts for this chain, sorted by anchored_at descending
  const chainThoughts = useMemo(() => {
    return thoughts
      .filter((t) => t.chain_id === chain.id && t.state === 'anchored')
      .sort((a, b) => {
        const timeA = new Date(a.anchored_at || a.created_at).getTime();
        const timeB = new Date(b.anchored_at || b.created_at).getTime();
        return timeB - timeA; // Newest first
      });
  }, [thoughts, chain.id]);
  
  const headerText = formatChainHeader(chain);
  
  // Handle continue chain
  const handleContinue = () => {
    setActiveChain(chain.id);
    // Create thought for this chain
    // Note: We'll need to update createThought to accept chainId
    createThought(undefined);
  };
  
  // Handle break chain
  const handleBreak = () => {
    if (!user) return;
    // Creates new chain and makes it active
    breakChain(user.id);
  };
  
  // Handle merge (V2 - placeholder)
  const handleMerge = () => {
    console.log('Merge modal - V2 feature');
    // TODO: Open merge modal
  };
  
  return (
    <div 
      className={cn(
        "chain-thread relative",
        isActive && "is-active"
      )}
    >
      {/* Chain header */}
      <div className="chain-header flex items-center justify-between mb-4 px-2">
        <h3 
          className={cn(
            "text-sm font-medium transition-colors",
            isActive ? "opacity-80" : "opacity-50"
          )}
          style={{ color: isActive ? '#3D3833' : '#6B635B' }}
        >
          {headerText}
        </h3>
        
        {/* Chain indicator */}
        <div 
          className="w-2 h-2 rounded-full"
          style={{ 
            background: isActive ? PB_BLUE : `${PB_BLUE}40`,
            boxShadow: isActive ? `0 0 8px ${PB_BLUE}50` : 'none',
          }}
        />
      </div>
      
      {/* Thread line container */}
      <div className="thread-container relative pl-6">
        {/* Vertical thread line */}
        <div 
          className="absolute left-3 top-0 bottom-0 w-[2px]"
          style={{ 
            background: isInLens 
              ? `repeating-linear-gradient(to bottom, ${PB_BLUE}15 0, ${PB_BLUE}15 4px, transparent 4px, transparent 8px)`
              : `${PB_BLUE}15`,
          }}
        />
        
        {/* Thoughts */}
        <div className="space-y-4">
          {chainThoughts.map((thought, index) => (
            <div key={thought.id} className="relative">
              {/* Thread connector dot */}
              <div 
                className="absolute -left-[19px] top-4 w-2 h-2 rounded-full"
                style={{ 
                  background: `${PB_BLUE}30`,
                  border: `1px solid ${PB_BLUE}20`,
                }}
              />
              
              <AnchoredThought 
                thoughtId={thought.id} 
                depth={index}
              />
            </div>
          ))}
        </div>
        
        {/* Open circle at the end */}
        <div className="relative mt-6 flex justify-center">
          {/* Final thread segment */}
          <div 
            className="absolute -left-[9px] -top-6 w-[2px] h-6"
            style={{ background: `${PB_BLUE}15` }}
          />
          
          <OpenCircle
            onContinue={handleContinue}
            onBreak={handleBreak}
            onMerge={handleMerge}
            size={isActive ? 'lg' : 'md'}
          />
        </div>
      </div>
    </div>
  );
}
