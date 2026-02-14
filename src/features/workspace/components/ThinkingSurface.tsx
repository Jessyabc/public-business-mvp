/**
 * Pillar #1: Active Thinking State
 * 
 * Glassmorphic UI for fluid, provisional thinking.
 * PB Blue glow appears when focused = active cognition.
 * When thought settles, blue fades and thought becomes warm neumorphic.
 * 
 * Swipe-down gesture anchors the thought into the feed.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { useChainStore } from '../stores/chainStore';
import { useAuth } from '@/contexts/AuthContext';
import { useHaptic } from '@/hooks/useHaptic';
import { cn } from '@/lib/utils';

const PB_BLUE = '#489FE3';
const SWIPE_DOWN_THRESHOLD = 60; // px to trigger anchor

interface ThinkingSurfaceProps {
  thoughtId: string;
  onAnchor?: (thoughtId?: string) => void;
  autoFocus?: boolean;
}

export function ThinkingSurface({ thoughtId, onAnchor, autoFocus = false }: ThinkingSurfaceProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [enterCount, setEnterCount] = useState(0);
  const originalContentRef = useRef<string>('');
  const wasAnchoredRef = useRef<boolean>(false);
  const isMobile = useIsMobile();
  const { thoughts, updateThought, anchorThought, deleteThought, cancelEdit, editThought } = useWorkspaceStore();
  const { activeChainId, pendingChainId, getChainById } = useChainStore();
  const { user } = useAuth();
  const { triggerHaptic } = useHaptic();
  
  // Swipe-down state
  const swipeY = useMotionValue(0);
  const swipeOpacity = useTransform(swipeY, [0, SWIPE_DOWN_THRESHOLD], [1, 0.4]);
  const swipeScale = useTransform(swipeY, [0, SWIPE_DOWN_THRESHOLD], [1, 0.95]);
  const controls = useAnimation();
  const swipeStartRef = useRef<{ y: number; scrollTop: number } | null>(null);
  const isSwipingRef = useRef(false);
  
  const thought = thoughts.find((t) => t.id === thoughtId);
  const pendingChain = pendingChainId ? getChainById(pendingChainId) : null;
  const activeChain = activeChainId ? getChainById(activeChainId) : null;
  const writingChain = pendingChain || activeChain;
  const chainLabel = writingChain?.display_label || (writingChain ? 'Current chain' : null);
  const isPending = !!pendingChain;
  
  useEffect(() => {
    if (thought) {
      originalContentRef.current = thought.content;
      wasAnchoredRef.current = thought.state === 'anchored';
    }
  }, [thoughtId]);
  
  useEffect(() => { setEnterCount(0); }, [thought?.content]);
  
  useEffect(() => {
    if (textareaRef.current && autoFocus) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [thoughtId, autoFocus]);

  const handleInput = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateThought(thoughtId, e.target.value);
    handleInput();
  }, [thoughtId, updateThought, handleInput]);

  // Anchor helper (shared by blur and swipe)
  const performAnchor = useCallback(() => {
    if (!thought) return;
    
    const currentContent = thought.content.trim();
    const originalContent = originalContentRef.current.trim();
    const wasAnchored = wasAnchoredRef.current;
    const hasChanges = currentContent !== originalContent;
    
    if (!hasChanges) {
      if (wasAnchored) {
        cancelEdit(thoughtId, originalContentRef.current);
        onAnchor?.(thoughtId);
      } else {
        if (!currentContent) {
          deleteThought(thoughtId);
          onAnchor?.(thoughtId);
        } else {
          anchorThought(thoughtId);
          onAnchor?.(thoughtId);
        }
      }
      return;
    }
    
    if (currentContent) {
      if (wasAnchored) {
        cancelEdit(thoughtId, originalContentRef.current);
        const newThoughtId = editThought(thoughtId, currentContent, user?.id);
        onAnchor?.(newThoughtId ?? thoughtId);
      } else {
        anchorThought(thoughtId);
        onAnchor?.(thoughtId);
      }
    } else {
      deleteThought(thoughtId);
      onAnchor?.(thoughtId);
    }
  }, [thought, thoughtId, anchorThought, deleteThought, cancelEdit, editThought, onAnchor, user?.id]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setEnterCount(0);
    performAnchor();
  }, [performAnchor]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (thought?.content.trim()) {
        anchorThought(thoughtId);
        onAnchor?.(thoughtId);
        textareaRef.current?.blur();
      }
      return;
    }
    
    if (isMobile && e.key === 'Enter' && !thought?.content.trim()) {
      const newCount = enterCount + 1;
      setEnterCount(newCount);
      if (newCount >= 2) {
        e.preventDefault();
        textareaRef.current?.blur();
        deleteThought(thoughtId);
        onAnchor?.(thoughtId);
      }
    }
  }, [thought, thoughtId, anchorThought, deleteThought, onAnchor, isMobile, enterCount]);

  useEffect(() => { handleInput(); }, [handleInput]);

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (textareaRef.current && e.target === e.currentTarget) {
      textareaRef.current.blur();
    }
  }, []);

  // --- Swipe-down to anchor gesture ---
  const handleSwipeTouchStart = useCallback((e: React.TouchEvent) => {
    const textarea = textareaRef.current;
    swipeStartRef.current = {
      y: e.touches[0].clientY,
      scrollTop: textarea?.scrollTop ?? 0,
    };
    isSwipingRef.current = false;
  }, []);

  const handleSwipeTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swipeStartRef.current) return;
    const dy = e.touches[0].clientY - swipeStartRef.current.y;
    
    // Only activate swipe-down if textarea is scrolled to top
    if (swipeStartRef.current.scrollTop <= 0 && dy > 10) {
      isSwipingRef.current = true;
      const clamped = Math.min(dy, SWIPE_DOWN_THRESHOLD * 1.5);
      swipeY.set(clamped);
      
      // Haptic at threshold
      if (clamped >= SWIPE_DOWN_THRESHOLD) {
        triggerHaptic('medium');
      }
    }
  }, [swipeY, triggerHaptic]);

  const handleSwipeTouchEnd = useCallback(() => {
    if (!isSwipingRef.current) {
      swipeStartRef.current = null;
      return;
    }
    
    const currentY = swipeY.get();
    if (currentY >= SWIPE_DOWN_THRESHOLD && thought?.content.trim()) {
      // Animate out and anchor
      triggerHaptic('success');
      controls.start({ y: 100, opacity: 0, scale: 0.9, transition: { duration: 0.25 } })
        .then(() => {
          performAnchor();
          swipeY.set(0);
          controls.set({ y: 0, opacity: 1, scale: 1 });
        });
    } else {
      // Spring back
      swipeY.set(0);
    }
    
    swipeStartRef.current = null;
    isSwipingRef.current = false;
  }, [swipeY, thought, performAnchor, controls, triggerHaptic]);

  if (!thought) return null;

  return (
    <motion.div 
      className={cn(
        "thinking-surface",
        "relative w-full max-w-2xl mx-auto",
        "transition-all duration-300 ease-out"
      )}
      onClick={handleContainerClick}
      style={{ opacity: swipeOpacity, scale: swipeScale }}
      animate={controls}
      onTouchStart={handleSwipeTouchStart}
      onTouchMove={handleSwipeTouchMove}
      onTouchEnd={handleSwipeTouchEnd}
    >
      {/* PB Blue focus glow */}
      <div 
        className="absolute -inset-3 rounded-3xl transition-all duration-500 pointer-events-none"
        style={{
          background: isFocused 
            ? `radial-gradient(ellipse at center, ${PB_BLUE}15 0%, transparent 70%)`
            : 'transparent',
          opacity: isFocused ? 1 : 0,
        }}
      />
      
      {/* Glassmorphic container */}
      <div 
        className="relative rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(255, 255, 255, 0.35)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: isFocused 
            ? `1px solid ${PB_BLUE}40`
            : '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: isFocused
            ? `0 8px 32px rgba(72, 159, 227, 0.15), 0 0 0 1px rgba(72, 159, 227, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.2)`
            : `0 8px 32px rgba(166, 150, 130, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.2)`,
        }}
      >
        {/* Glass shine */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)'
          }}
        />
        
        <textarea
          ref={textareaRef}
          value={thought.content}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind..."
          className={cn(
            "relative z-10 w-full min-h-[120px] p-6",
            "bg-transparent border-none outline-none resize-none",
            "text-lg leading-relaxed",
            "placeholder:opacity-40",
            "focus:outline-none focus:ring-0"
          )}
          style={{
            color: '#3D3833',
            caretColor: PB_BLUE,
          }}
        />
      </div>
      
      {/* Chain indicator */}
      {chainLabel && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <span 
            className="text-xs px-2 py-0.5 rounded-full opacity-60"
            style={{ color: PB_BLUE, background: `${PB_BLUE}15` }}
          >
            Writing to: {chainLabel}
            {isPending && <span className="ml-1 opacity-75">(pending)</span>}
          </span>
        </div>
      )}
      
      {/* Swipe hint + keyboard hint */}
      {!thought.content && (
        <p className="text-center text-sm mt-4 opacity-50" style={{ color: '#6B635B' }}>
          {isMobile ? 'Swipe down or tap outside to save' : 'Just start writing. Press ⌘↵ to save.'}
        </p>
      )}
      
      {/* Swipe-down visual indicator */}
      {isSwipingRef.current && swipeY.get() > 10 && (
        <motion.div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium"
          style={{ color: PB_BLUE }}
          initial={{ opacity: 0 }}
          animate={{ opacity: swipeY.get() >= SWIPE_DOWN_THRESHOLD ? 1 : 0.5 }}
        >
          {swipeY.get() >= SWIPE_DOWN_THRESHOLD ? '↓ Release to anchor' : '↓ Pull to anchor'}
        </motion.div>
      )}
    </motion.div>
  );
}
