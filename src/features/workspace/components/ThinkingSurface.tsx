/**
 * Pillar #1: Active Thinking State
 * 
 * Glassmorphic UI for fluid, provisional thinking.
 * PB Blue glow appears when focused = active cognition.
 * When thought settles, blue fades and thought becomes warm neumorphic.
 * 
 * Performance: Minimal blur, GPU-optimized shadows
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { useChainStore } from '../stores/chainStore';
import { cn } from '@/lib/utils';
import { format, parseISO, isToday } from 'date-fns';

// PB Blue - represents active cognition
const PB_BLUE = '#489FE3';

interface ThinkingSurfaceProps {
  thoughtId: string;
  onAnchor?: () => void;
  autoFocus?: boolean;
}

export function ThinkingSurface({ thoughtId, onAnchor, autoFocus = false }: ThinkingSurfaceProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [enterCount, setEnterCount] = useState(0);
  const originalContentRef = useRef<string>(''); // Track original content when editing starts
  const isMobile = useIsMobile();
  const { thoughts, updateThought, anchorThought, deleteThought, cancelEdit, activeDayKey } = useWorkspaceStore();
  const { activeChainId, pendingChainId, getChainById } = useChainStore();
  
  const thought = thoughts.find((t) => t.id === thoughtId);
  // Check pending chain first (from break gesture), then active chain
  const pendingChain = pendingChainId ? getChainById(pendingChainId) : null;
  const activeChain = activeChainId ? getChainById(activeChainId) : null;
  
  // Show which day/chain we're adding to
  const showDayLabel = activeDayKey && !isToday(parseISO(activeDayKey));
  const dayLabel = activeDayKey ? format(parseISO(activeDayKey), 'MMMM d') : null;
  
  // Chain indicator - shows which chain we're writing to (pending takes priority)
  const writingChain = pendingChain || activeChain;
  const chainLabel = writingChain?.display_label || (writingChain ? 'Current chain' : null);
  const isPending = !!pendingChain;
  
  // Track original content when thought becomes active (for cancel detection)
  useEffect(() => {
    if (thought) {
      originalContentRef.current = thought.content;
    }
  }, [thoughtId]); // Only update when thoughtId changes (new edit session)
  
  // Reset enter count when content changes
  useEffect(() => {
    setEnterCount(0);
  }, [thought?.content]);
  
  // Only auto-focus when user deliberately initiated thinking
  useEffect(() => {
    if (textareaRef.current && autoFocus) {
      textareaRef.current.focus();
      // Place cursor at end
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [thoughtId, autoFocus]);

  // Auto-resize textarea
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

  // Implicit anchoring: blur with content = anchor, dismiss if empty
  // If no changes were made, cancel the edit and restore original state
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setEnterCount(0);
    
    if (!thought) return;
    
    const currentContent = thought.content.trim();
    const originalContent = originalContentRef.current.trim();
    const wasAnchored = thought.state === 'anchored';
    const hasChanges = currentContent !== originalContent;
    
    // If no changes were made, cancel the edit
    if (!hasChanges) {
      if (wasAnchored) {
        // Restore to anchored state without changing timestamps or day_key
        cancelEdit(thoughtId, originalContentRef.current);
        onAnchor?.();
      } else {
        // New thought with no content - delete it
        if (!currentContent) {
          deleteThought(thoughtId);
          onAnchor?.();
        } else {
          // New thought with original content - anchor it
          anchorThought(thoughtId);
          onAnchor?.();
        }
      }
      return;
    }
    
    // Changes were made - proceed with normal behavior
    if (currentContent) {
      anchorThought(thoughtId);
      onAnchor?.();
    } else {
      // Empty content - delete the active thought to show "tap to think"
      deleteThought(thoughtId);
      onAnchor?.();
    }
  }, [thought, thoughtId, anchorThought, deleteThought, cancelEdit, onAnchor]);

  // Cmd+Enter (or Ctrl+Enter) to anchor immediately
  // On mobile: double Enter with empty content = dismiss
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (thought?.content.trim()) {
        anchorThought(thoughtId);
        onAnchor?.();
        textareaRef.current?.blur();
      }
      return;
    }
    
    // Mobile: double Enter on empty content = dismiss keyboard and surface
    if (isMobile && e.key === 'Enter' && !thought?.content.trim()) {
      const newCount = enterCount + 1;
      setEnterCount(newCount);
      
      if (newCount >= 2) {
        e.preventDefault();
        textareaRef.current?.blur();
        deleteThought(thoughtId);
        onAnchor?.();
      }
    }
  }, [thought, thoughtId, anchorThought, deleteThought, onAnchor, isMobile, enterCount]);

  // Initial resize
  useEffect(() => {
    handleInput();
  }, [handleInput]);

  // Handle click outside to blur (cancel edit if no changes)
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    // If clicking on the container but not on the textarea, blur it
    if (textareaRef.current && e.target === e.currentTarget) {
      textareaRef.current.blur();
    }
  }, []);

  if (!thought) return null;

  return (
    <div 
      className={cn(
        "thinking-surface",
        "relative w-full max-w-2xl mx-auto",
        "transition-all duration-300 ease-out"
      )}
      onClick={handleContainerClick}
    >
      {/* PB Blue focus glow - active cognition indicator */}
      <div 
        className="absolute -inset-3 rounded-3xl transition-all duration-500 pointer-events-none"
        style={{
          background: isFocused 
            ? `radial-gradient(ellipse at center, ${PB_BLUE}15 0%, transparent 70%)`
            : 'transparent',
          opacity: isFocused ? 1 : 0,
        }}
      />
      
      {/* Glassmorphic container - frosted glass effect */}
      <div 
        className="relative rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          // Glassmorphism: semi-transparent with blur
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
        {/* Subtle glass shine */}
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
      
      {/* Day/Chain indicator when adding to a previous day or specific chain */}
      {(showDayLabel || chainLabel) && (
        <div className="flex items-center justify-center gap-2 mt-3">
          {chainLabel && (
            <span 
              className="text-xs px-2 py-0.5 rounded-full opacity-60"
              style={{ 
                color: PB_BLUE,
                background: `${PB_BLUE}15`,
              }}
            >
              Writing to: {chainLabel}
              {isPending && (
                <span className="ml-1 opacity-75">(pending)</span>
              )}
            </span>
          )}
          {showDayLabel && dayLabel && (
            <span 
              className="text-xs opacity-60"
              style={{ color: '#9A8F85' }}
            >
              {chainLabel ? '·' : ''} Adding to {dayLabel}
            </span>
          )}
        </div>
      )}
      
      {/* Gentle hint - only show when empty */}
      {!thought.content && (
        <p 
          className="text-center text-sm mt-4 opacity-50"
          style={{ color: '#6B635B' }}
        >
          Just start writing. Press ⌘↵ to save.
        </p>
      )}
    </div>
  );
}
