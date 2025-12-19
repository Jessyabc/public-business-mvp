/**
 * Pillar #1: Anchored Thought State
 * 
 * Paper-like neumorphism for grounded, externalized thoughts.
 * Spatial hierarchy via depth prop - recent thoughts are prominent,
 * older ones gently recede.
 * 
 * Phase 3: Temporal lineage via timestamp display.
 * - Timestamp is the default identity
 * - User can rename by clicking timestamp (cosmetic only)
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';

interface AnchoredThoughtProps {
  thoughtId: string;
  depth?: number; // 0 = most recent, higher = older
}

/**
 * Format timestamp for display - human-readable, not intimidating
 */
function formatThoughtTime(isoString: string): string {
  const date = new Date(isoString);
  
  if (isToday(date)) {
    return format(date, 'h:mm a'); // "2:32 PM"
  }
  if (isYesterday(date)) {
    return 'Yesterday, ' + format(date, 'h:mm a');
  }
  if (isThisWeek(date)) {
    return format(date, 'EEEE, h:mm a'); // "Tuesday, 2:32 PM"
  }
  return format(date, 'MMM d, h:mm a'); // "Dec 19, 2:32 PM"
}

export function AnchoredThought({ thoughtId, depth = 0 }: AnchoredThoughtProps) {
  const { thoughts, reactivateThought, deleteThought, updateDisplayLabel } = useWorkspaceStore();
  const [isSettling, setIsSettling] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const thought = thoughts.find((t) => t.id === thoughtId);
  
  // Detect newly anchored thoughts for settling animation
  useEffect(() => {
    if (depth === 0 && thought?.state === 'anchored') {
      setIsSettling(true);
      const timer = setTimeout(() => setIsSettling(false), 400);
      return () => clearTimeout(timer);
    }
  }, [depth, thought?.state]);
  
  const handleClick = useCallback(() => {
    reactivateThought(thoughtId);
  }, [thoughtId, reactivateThought]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteThought(thoughtId);
  }, [thoughtId, deleteThought]);

  // Start editing the label
  const handleStartEditLabel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setLabelDraft(thought?.display_label || '');
    setIsEditingLabel(true);
    // Focus will happen via useEffect after render
  }, [thought?.display_label]);

  // Save the label
  const handleSaveLabel = useCallback(() => {
    const trimmed = labelDraft.trim();
    updateDisplayLabel(thoughtId, trimmed || null);
    setIsEditingLabel(false);
  }, [labelDraft, thoughtId, updateDisplayLabel]);

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setIsEditingLabel(false);
    setLabelDraft('');
  }, []);

  // Handle input events
  const handleLabelKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleSaveLabel();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }, [handleSaveLabel, handleCancelEdit]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingLabel && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingLabel]);

  if (!thought) return null;

  // Get the temporal identity (anchored_at preferred, fallback to created_at)
  const temporalIdentity = thought.anchored_at || thought.created_at;
  const displayText = thought.display_label || formatThoughtTime(temporalIdentity);

  // Spatial hierarchy: older thoughts gently recede
  const opacity = Math.max(0.6, 1 - depth * 0.08);
  const scale = Math.max(0.96, 1 - depth * 0.01);

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
        "hover:translate-y-[-2px]",
        // Entry animation for new thoughts, settle for just-anchored
        isSettling ? "animate-thought-settle" : "animate-thought-enter"
      )}
      style={{
        opacity,
        transform: `scale(${scale})`,
        // Stagger animation based on depth
        animationDelay: `${depth * 50}ms`,
      }}
    >
      {/* Warm neumorphic card - thought at rest */}
      <div 
        className="relative rounded-2xl p-5 transition-all duration-300"
        style={{
          // Warmer base than business - sanctuary feel
          background: '#F0EBE6',
          // Softer, more organic shadows
          boxShadow: `
            6px 6px 14px rgba(180, 165, 145, 0.25),
            -6px -6px 14px rgba(255, 255, 255, 0.85)
          `,
        }}
        onMouseEnter={(e) => {
          // Gentle lift effect on hover
          e.currentTarget.style.boxShadow = `
            8px 8px 18px rgba(180, 165, 145, 0.3),
            -8px -8px 18px rgba(255, 255, 255, 0.95)
          `;
          e.currentTarget.style.background = '#F2EDE8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `
            6px 6px 14px rgba(180, 165, 145, 0.25),
            -6px -6px 14px rgba(255, 255, 255, 0.85)
          `;
          e.currentTarget.style.background = '#F0EBE6';
        }}
      >
        {/* Temporal identity - subtle, clickable to rename */}
        <div className="mb-3">
          {isEditingLabel ? (
            <input
              ref={inputRef}
              type="text"
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onBlur={handleSaveLabel}
              onKeyDown={handleLabelKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-transparent border-none outline-none text-xs focus:outline-none"
              style={{ 
                color: '#9A8F85',
              }}
              placeholder={formatThoughtTime(temporalIdentity)}
            />
          ) : (
            <button
              onClick={handleStartEditLabel}
              className={cn(
                "text-xs transition-colors duration-200 cursor-text text-left",
                thought.display_label && "opacity-80"
              )}
              style={{ color: '#A89F95' }}
              title={thought.display_label ? `${formatThoughtTime(temporalIdentity)} — click to edit` : 'Click to add a name'}
            >
              {displayText}
            </button>
          )}
        </div>

        {/* Content */}
        <p 
          className="text-base leading-relaxed whitespace-pre-wrap break-words line-clamp-6"
          style={{ color: '#3D3833' }}
        >
          {thought.content}
        </p>
        
        {/* Delete on hover only - minimal, non-intrusive */}
        <button
          onClick={handleDelete}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-xl",
            "opacity-0 group-hover:opacity-60",
            "hover:opacity-100",
            "transition-all duration-200"
          )}
          style={{
            color: '#9B9590',
          }}
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
  );
}
