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
import { useWorkspaceStore } from '../useWorkspaceStore';
import { cn } from '@/lib/utils';

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
  const { thoughts, updateThought, anchorThought } = useWorkspaceStore();
  
  const thought = thoughts.find((t) => t.id === thoughtId);
  
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

  // Implicit anchoring: blur with content = anchor
  const handleBlur = useCallback(() => {
    if (thought?.content.trim()) {
      anchorThought(thoughtId);
      onAnchor?.();
    }
  }, [thought, thoughtId, anchorThought, onAnchor]);

  // Cmd+Enter (or Ctrl+Enter) to anchor immediately
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (thought?.content.trim()) {
        anchorThought(thoughtId);
        onAnchor?.();
        textareaRef.current?.blur();
      }
    }
  }, [thought, thoughtId, anchorThought, onAnchor]);

  // Initial resize
  useEffect(() => {
    handleInput();
  }, [handleInput]);

  if (!thought) return null;

  return (
    <div className={cn(
      "thinking-surface",
      "relative w-full max-w-2xl mx-auto",
      "transition-all duration-300 ease-out"
    )}>
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
          onBlur={(e) => {
            setIsFocused(false);
            handleBlur();
          }}
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
