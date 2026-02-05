/**
 * Think Space: Continue Prompt - Inactivity Hint
 * 
 * Non-blocking visual hint after 30 min of inactivity.
 * User can ignore; thoughts continue same chain.
 * Disappears on next thought submission.
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { useChainStore } from '../stores/chainStore';

// 30 minutes in milliseconds
const INACTIVITY_THRESHOLD = 30 * 60 * 1000;

// PB Blue
const PB_BLUE = '#489FE3';

interface ContinuePromptProps {
  className?: string;
}

export function ContinuePrompt({ className }: ContinuePromptProps) {
  const { thoughts } = useWorkspaceStore();
  const { activeChainId } = useChainStore();
  const [showPrompt, setShowPrompt] = useState(false);

  // Find the last anchored thought in the active chain
  const lastThoughtInActiveChain = useMemo(() => {
    if (!activeChainId) return null;
    
    const chainThoughts = thoughts
      .filter(t => t.chain_id === activeChainId && t.state === 'anchored')
      .sort((a, b) => {
        const timeA = new Date(a.anchored_at || a.created_at).getTime();
        const timeB = new Date(b.anchored_at || b.created_at).getTime();
        return timeB - timeA; // Newest first
      });
    
    return chainThoughts[0] || null;
  }, [thoughts, activeChainId]);

  // Check inactivity and show prompt if needed
  useEffect(() => {
    if (!lastThoughtInActiveChain) {
      setShowPrompt(false);
      return;
    }

    const lastTime = new Date(
      lastThoughtInActiveChain.anchored_at || lastThoughtInActiveChain.created_at
    ).getTime();
    const now = Date.now();
    const timeSinceLastThought = now - lastTime;

    // Show prompt if more than 30 min since last thought
    if (timeSinceLastThought >= INACTIVITY_THRESHOLD) {
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
      
      // Set timer to show prompt when threshold is reached
      const timeUntilPrompt = INACTIVITY_THRESHOLD - timeSinceLastThought;
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, timeUntilPrompt);
      
      return () => clearTimeout(timer);
    }
  }, [lastThoughtInActiveChain]);

  // Hide prompt when new thought is added
  useEffect(() => {
    if (thoughts.some(t => t.state === 'active')) {
      setShowPrompt(false);
    }
  }, [thoughts]);

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          className={className}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <span 
            className="text-xs opacity-60"
            style={{ color: PB_BLUE }}
          >
            Continue this chain?
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}