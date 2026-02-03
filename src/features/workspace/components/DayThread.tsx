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
import { useChainStore } from '../stores/chainStore';
import { AnchoredThought } from './AnchoredThought';
import { Plus, Link2Off } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';
import type { DayThread as DayThreadType } from '../types';
import { registerDayScrollRef } from './ThoughtStack';

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
  const { getChainById, updateChainLabel } = useChainStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  
  // Chain break editing state (per chain)
  const [editingChainBreak, setEditingChainBreak] = useState<string | null>(null);
  const [chainBreakDraft, setChainBreakDraft] = useState('');
  const chainBreakInputRef = useRef<HTMLInputElement>(null);

  // Register this day thread for scrolling
  useEffect(() => {
    if (dayRef.current) {
      registerDayScrollRef(thread.day_key, dayRef.current);
    }
    return () => {
      registerDayScrollRef(thread.day_key, null);
    };
  }, [thread.day_key]);
  
  // Display title: use custom label if set, otherwise use smart date formatting
  const displayTitle = thread.display_label ? thread.display_label : formatDayHeader(thread.day_key);
  const hasCustomTitle = !!thread.display_label && thread.display_label.trim() !== '';

  // Start editing title - show current custom label or empty string
  const handleStartEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // If there's a custom label, show it; otherwise show empty to allow typing
    setTitleDraft(thread.display_label || '');
    setIsEditingTitle(true);
  }, [thread.display_label]);

  // Save title - if empty, set to null to revert to smart date formatting
  const handleSaveTitle = useCallback(() => {
    const trimmed = titleDraft.trim();
    // If empty string, set to null to use smart date formatting
    updateDayLabel(thread.day_key, trimmed === '' ? null : trimmed);
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

  // Chain break editing handlers
  const handleStartEditChainBreak = useCallback((e: React.MouseEvent, chainId: string) => {
    e.stopPropagation();
    const chain = getChainById(chainId);
    setChainBreakDraft(chain?.display_label || '');
    setEditingChainBreak(chainId);
  }, [getChainById]);
  
  const handleSaveChainBreakTitle = useCallback((chainId: string) => {
    const trimmed = chainBreakDraft.trim();
    updateChainLabel(chainId, trimmed === '' ? null : trimmed);
    setEditingChainBreak(null);
    setChainBreakDraft('');
  }, [chainBreakDraft, updateChainLabel]);
  
  const handleCancelChainBreakEdit = useCallback(() => {
    setEditingChainBreak(null);
    setChainBreakDraft('');
  }, []);
  
  const handleChainBreakKeyDown = useCallback((e: React.KeyboardEvent, chainId: string) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleSaveChainBreakTitle(chainId);
    } else if (e.key === 'Escape') {
      handleCancelChainBreakEdit();
    }
  }, [handleSaveChainBreakTitle, handleCancelChainBreakEdit]);
  
  // Focus chain break input when editing starts
  useEffect(() => {
    if (editingChainBreak && chainBreakInputRef.current) {
      chainBreakInputRef.current.focus();
      chainBreakInputRef.current.select();
    }
  }, [editingChainBreak]);

  return (
    <div ref={dayRef} className="day-thread" data-day-key={thread.day_key}>
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
        {thread.thoughts.map((thought, index) => {
          // Check if this is a new chain (chain_id differs from previous thought)
          const prevThought = index > 0 ? thread.thoughts[index - 1] : null;
          const isNewChain = prevThought && prevThought.chain_id && thought.chain_id && prevThought.chain_id !== thought.chain_id;
          
          // Get chain info to check if it's a break (has diverged_from_chain_id)
          const chain = thought.chain_id ? getChainById(thought.chain_id) : null;
          const isChainBreak = chain?.diverged_from_chain_id != null;
          
          // Format timestamp for chain break (use first thought's timestamp in this chain)
          const chainBreakTimestamp = thought.anchored_at || thought.created_at;
          const chainBreakTimeString = format(parseISO(chainBreakTimestamp), 'h:mm a');
          
          // Get display label for chain break (chain label or timestamp)
          const chainBreakLabel = chain?.display_label || chainBreakTimeString;
          const isEditingThisChainBreak = editingChainBreak === thought.chain_id;
          
          return (
            <div key={thought.id}>
              {/* Visual break for new chain with broken chain icon */}
              {isNewChain && (
                <div className="my-6 flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(72, 159, 227, 0.3), transparent)' }} />
                  <div className="flex items-center gap-2">
                    {/* Broken chain icon */}
                    {isChainBreak && (
                      <Link2Off 
                        className="w-4 h-4" 
                        style={{ color: '#489FE3' }}
                      />
                    )}
                    {/* Editable timestamp/title */}
                    {isEditingThisChainBreak ? (
                      <input
                        ref={chainBreakInputRef}
                        type="text"
                        value={chainBreakDraft}
                        onChange={(e) => setChainBreakDraft(e.target.value)}
                        onBlur={() => handleSaveChainBreakTitle(thought.chain_id!)}
                        onKeyDown={(e) => handleChainBreakKeyDown(e, thought.chain_id!)}
                        className="bg-transparent border-none outline-none text-xs font-medium min-w-[60px]"
                        style={{ color: '#489FE3' }}
                        placeholder={chainBreakTimeString}
                      />
                    ) : (
                      <button
                        onClick={(e) => handleStartEditChainBreak(e, thought.chain_id!)}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80"
                        style={{ 
                          color: '#489FE3',
                          background: 'rgba(72, 159, 227, 0.1)',
                          border: '1px solid rgba(72, 159, 227, 0.2)'
                        }}
                        title="Click to edit"
                      >
                        {chainBreakLabel}
                      </button>
                    )}
                  </div>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(72, 159, 227, 0.3), transparent)' }} />
                </div>
              )}
              <AnchoredThought
                thoughtId={thought.id}
                depth={index}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
