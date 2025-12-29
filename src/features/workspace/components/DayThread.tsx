/**
 * Pillar #1: Day Thread Component
 * 
 * Groups thoughts by day with:
 * - Clickable date header (shows custom title or formatted date)
 * - Click date to add custom title, clear to revert to date
 * - Add new entry button to prepend thoughts
 * - List of thought entries within the day
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { AnchoredThought } from './AnchoredThought';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';
import type { DayThread as DayThreadType } from '../types';

interface DayThreadProps {
  thread: DayThreadType;
  isFirst?: boolean;
}

/**
 * Format day key for display
 */
function formatDayHeader(dayKey: string): string {
  const date = parseISO(dayKey);
  
  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  if (isThisWeek(date)) {
    return format(date, 'EEEE'); // "Tuesday"
  }
  if (isThisYear(date)) {
    return format(date, 'MMMM d'); // "December 19"
  }
  return format(date, 'MMMM d, yyyy'); // "December 19, 2024"
}

export function DayThread({ thread, isFirst = false }: DayThreadProps) {
  const { createThought, updateDayLabel, setActiveDayKey } = useWorkspaceStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const displayTitle = thread.display_label || formatDayHeader(thread.day_key);
  const hasCustomTitle = !!thread.display_label;

  // Start editing title
  const handleStartEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setTitleDraft(thread.display_label || '');
    setIsEditingTitle(true);
  }, [thread.display_label]);

  // Save title
  const handleSaveTitle = useCallback(() => {
    const trimmed = titleDraft.trim();
    updateDayLabel(thread.day_key, trimmed || null);
    setIsEditingTitle(false);
  }, [titleDraft, thread.day_key, updateDayLabel]);

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setIsEditingTitle(false);
    setTitleDraft('');
  }, []);

  // Handle key events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }, [handleSaveTitle, handleCancelEdit]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  // Add new thought to this day
  const handleAddToDay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDayKey(thread.day_key);
    createThought(thread.day_key);
  }, [thread.day_key, createThought, setActiveDayKey]);

  return (
    <div className="day-thread">
      {/* Day header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              ref={inputRef}
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none text-lg font-medium"
              style={{ color: '#4A4540' }}
              placeholder={formatDayHeader(thread.day_key)}
            />
          ) : (
            <button
              onClick={handleStartEdit}
              className={cn(
                "text-lg font-medium transition-colors duration-200 text-left",
                "hover:opacity-80 cursor-text"
              )}
              style={{ color: hasCustomTitle ? '#3D3833' : '#6B635B' }}
              title={hasCustomTitle 
                ? `${formatDayHeader(thread.day_key)} — click to edit` 
                : 'Click to add a title'
              }
            >
              {displayTitle}
            </button>
          )}
          
          {/* Show actual date if custom title is set */}
          {hasCustomTitle && !isEditingTitle && (
            <span 
              className="text-xs opacity-60"
              style={{ color: '#9A8F85' }}
            >
              {formatDayHeader(thread.day_key)}
            </span>
          )}
        </div>
        
        {/* Add to day button */}
        <button
          onClick={handleAddToDay}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-full",
            "text-xs transition-all duration-200",
            "opacity-60 hover:opacity-100"
          )}
          style={{ 
            color: '#6B635B',
            background: 'rgba(234, 229, 224, 0.5)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(234, 229, 224, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(234, 229, 224, 0.5)';
          }}
          title="Add another thought to this day"
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>
      
      {/* Thought entries */}
      <div className="space-y-3 pl-2">
        {thread.thoughts.map((thought, index) => (
          <AnchoredThought
            key={thought.id}
            thoughtId={thought.id}
            depth={index}
          />
        ))}
      </div>
    </div>
  );
}
