/**
 * Pillar #1: Days List Sidebar
 * 
 * Shows a list of all days with thoughts, allowing quick navigation.
 * Clicking a day scrolls to that day's thread.
 */

import { useCallback } from 'react';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { cn } from '@/lib/utils';
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';
import { Calendar, X } from 'lucide-react';
import { scrollToDay } from './ThoughtStack';

interface DaysListProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Format day key for display in the list
 */
function formatDayLabel(dayKey: string, displayLabel?: string | null): string {
  if (displayLabel) return displayLabel;
  
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

export function DaysList({ isOpen, onClose }: DaysListProps) {
  const getDayThreads = useWorkspaceStore((state) => state.getDayThreads);
  const dayThreads = getDayThreads();

  // Scroll to a specific day thread
  const handleDayClick = useCallback((dayKey: string) => {
    scrollToDay(dayKey);
    onClose();
  }, [onClose]);

  if (!isOpen || dayThreads.length === 0) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:bg-transparent"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-64 z-50",
          "bg-[#F5F0EB] shadow-2xl",
          "transition-transform duration-300 ease-out",
          "overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{
          boxShadow: `
            4px 0 16px rgba(166, 150, 130, 0.15),
            inset -1px 0 0 rgba(255, 255, 255, 0.5)
          `
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#F5F0EB] border-b border-[#E0D9D0] px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: '#6B635B' }} />
            <h2 className="text-sm font-semibold" style={{ color: '#3D3833' }}>
              Days
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#EAE5E0] transition-colors"
            aria-label="Close days list"
          >
            <X className="w-4 h-4" style={{ color: '#6B635B' }} />
          </button>
        </div>

        {/* Days List */}
        <div className="px-2 py-4 space-y-1">
          {dayThreads.map((thread) => {
            const thoughtCount = thread.thoughts.length;
            const label = formatDayLabel(thread.day_key, thread.display_label);
            
            return (
              <button
                key={thread.day_key}
                onClick={() => handleDayClick(thread.day_key)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg",
                  "transition-all duration-200",
                  "hover:bg-[#EAE5E0] active:scale-[0.98]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm font-medium truncate flex-1"
                    style={{ color: '#3D3833' }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-xs ml-2 shrink-0 opacity-60"
                    style={{ color: '#6B635B' }}
                  >
                    {thoughtCount}
                  </span>
                </div>
                {thread.display_label && (
                  <div
                    className="text-xs mt-0.5 truncate opacity-60"
                    style={{ color: '#9A8F85' }}
                  >
                    {format(parseISO(thread.day_key), 'MMMM d, yyyy')}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

