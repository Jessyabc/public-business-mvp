/**
 * Think Space: Chain Thread Component
 * 
 * Visual thread connecting thoughts in a chain.
 * Shows the continuation point (OpenCircle) at the end.
 * 
 * Thread line: 2px, PB Blue at 15% opacity
 * Solid for raw chain, dashed for lens boundary
 */

import { useMemo, useCallback } from 'react';
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
  chain?: ThoughtChain;
  isActive?: boolean;
  isInLens?: boolean; // If true, show dashed connector
  showLine?: boolean; // Show just the thread line with children
  children?: React.ReactNode;
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
  showLine = false,
  children,
}: ChainThreadProps) {
  const { user } = useAuth();
  const { thoughts, createThought } = useWorkspaceStore();
  const { breakChain, setActiveChain } = useChainStore();
  
  // Get thoughts for this chain, sorted by anchored_at descending
  // Must be called before any early returns
  const chainThoughts = useMemo(() => {
    if (!chain) return [];
    return thoughts
      .filter((t) => t.chain_id === chain.id && t.state === 'anchored')
      .sort((a, b) => {
        const timeA = new Date(a.anchored_at || a.created_at).getTime();
        const timeB = new Date(b.anchored_at || b.created_at).getTime();
        return timeB - timeA; // Newest first
      });
  }, [thoughts, chain]);
  
  // Callbacks must also be before early returns
  const handleContinue = useCallback(() => {
    if (!chain) return;
    setActiveChain(chain.id);
    createThought(undefined);
  }, [chain, setActiveChain, createThought]);
  
  const handleBreak = useCallback(() => {
    if (!user || !chain) return;
    // Pass divergence metadata: fromChainId and the last thought in this chain
    const lastThought = chainThoughts[0]; // Newest first, so [0] is the last
    breakChain(user.id, chain.id, lastThought?.id ?? null);
  }, [user, breakChain, chain, chainThoughts]);
  
  const handleMerge = useCallback(() => {
    console.log('Merge modal - V2 feature');
  }, []);
  
  // Simple mode: just show thread line with children
  if (showLine && children) {
    return (
      <div className="chain-thread-simple relative flex flex-col items-center">
        {/* Thread line above */}
        <div 
          className="w-[2px] h-8"
          style={{ background: `${PB_BLUE}15` }}
        />
        {children}
      </div>
    );
  }
  
  // Full mode requires a chain
  if (!chain) {
    return null;
  }
  
  const headerText = formatChainHeader(chain);
  
  return (
    <div 
      className={cn(
        "chain-thread relative",
        isActive && "is-active"
      )}
    >
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
              
              {/* Chain timestamp under the LAST (oldest) thought */}
              {index === chainThoughts.length - 1 && (
                <div className="chain-footer flex items-center gap-2 mt-3 pl-1">
                  <div 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ 
                      background: isActive ? PB_BLUE : `${PB_BLUE}40`,
                      boxShadow: isActive ? `0 0 6px ${PB_BLUE}50` : 'none',
                    }}
                  />
                  <span 
                    className={cn(
                      "text-xs font-medium transition-colors",
                      isActive ? "opacity-60" : "opacity-40"
                    )}
                    style={{ color: '#6B635B' }}
                  >
                    {headerText}
                  </span>
                </div>
              )}
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
            onBreak={handleBreak}
            size={isActive ? 'lg' : 'md'}
          />
        </div>
      </div>
    </div>
  );
}