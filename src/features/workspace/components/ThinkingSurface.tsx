/**
 * Pillar #1: Active Thinking State
 * 
 * Glass/frosted UI for fluid, provisional thinking.
 * No outlines, no structure, no metrics.
 * Cursor placed immediately on entry.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { cn } from '@/lib/utils';

interface ThinkingSurfaceProps {
  thoughtId: string;
  onAnchor?: () => void;
  autoFocus?: boolean;
}

export function ThinkingSurface({ thoughtId, onAnchor, autoFocus = false }: ThinkingSurfaceProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  // Initial resize
  useEffect(() => {
    handleInput();
  }, [handleInput]);

  if (!thought) return null;

  return (
    <div className={cn(
      "thinking-surface",
      "relative w-full max-w-2xl mx-auto",
      "transition-all duration-500 ease-out"
    )}>
      {/* Glass container */}
      <div className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-[var(--glass-bg)] backdrop-blur-xl",
        "border border-[var(--workspace-active-border)]",
        "shadow-[var(--workspace-active-glow)]",
        "transition-all duration-300"
      )}>
        {/* Subtle blue focus indicator */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-30 bg-gradient-to-br from-[hsl(var(--workspace-focus))] to-transparent" />
        
        <textarea
          ref={textareaRef}
          value={thought.content}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="What's on your mind..."
          className={cn(
            "w-full min-h-[120px] p-6",
            "bg-transparent border-none outline-none resize-none",
            "text-[var(--text-primary)] text-lg leading-relaxed",
            "placeholder:text-[var(--text-tertiary)] placeholder:opacity-60",
            "focus:outline-none focus:ring-0"
          )}
          style={{
            caretColor: 'hsl(var(--workspace-focus))',
          }}
        />
      </div>
      
      {/* Gentle hint - only show when empty */}
      {!thought.content && (
        <p className="text-center text-[var(--text-tertiary)] text-sm mt-4 opacity-50">
          Just start writing. It will be saved automatically.
        </p>
      )}
    </div>
  );
}
