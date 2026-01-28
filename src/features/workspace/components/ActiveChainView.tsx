/**
 * Think Space: Active Chain View Component
 * 
 * Displays the currently active chain with all its thoughts.
 * Provides focused view for continuing a thread of thoughts.
 * 
 * Features:
 * - Shows chain header with timestamp
 * - Displays all thoughts in the chain
 * - OpenCircle at the end for continuation
 * - Break chain action available
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChainThread } from './ChainThread';
import { useChainStore } from '../stores/chainStore';
import { useWorkspaceStore } from '../useWorkspaceStore';

interface ActiveChainViewProps {
  className?: string;
}

export function ActiveChainView({ className }: ActiveChainViewProps) {
  const { activeChainId, getActiveChain, chains } = useChainStore();
  const { thoughts } = useWorkspaceStore();
  
  const activeChain = useMemo(() => getActiveChain(), [activeChainId, chains]);
  
  // Check if the active chain has any thoughts
  const hasThoughts = useMemo(() => {
    if (!activeChainId) return false;
    return thoughts.some(
      (t) => t.chain_id === activeChainId && t.state === 'anchored'
    );
  }, [thoughts, activeChainId]);
  
  if (!activeChain) {
    return (
      <div 
        className={cn(
          "active-chain-view flex items-center justify-center",
          "text-[#6B635B] text-sm opacity-50",
          className
        )}
      >
        <p>No active chain selected</p>
      </div>
    );
  }
  
  return (
    <div className={cn("active-chain-view", className)}>
      <ChainThread 
        chain={activeChain} 
        isActive={true}
        isInLens={false}
      />
      
      {!hasThoughts && (
        <div className="mt-8 text-center text-[#6B635B] text-sm opacity-60">
          <p>Start adding thoughts to this chain...</p>
        </div>
      )}
    </div>
  );
}
