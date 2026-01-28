/**
 * Pillar #1: Thought Stack
 * 
 * Displays day threads - groups of thoughts organized by day.
 * Most recent day first, with ability to add to any previous day.
 */

import { useState } from 'react';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { DayThread } from './DayThread';
import { DaysList } from './DaysList';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

// Global refs map for scrolling to days
const dayScrollRefs = new Map<string, HTMLDivElement>();

export function registerDayScrollRef(dayKey: string, element: HTMLDivElement | null) {
  if (element) {
    dayScrollRefs.set(dayKey, element);
  } else {
    dayScrollRefs.delete(dayKey);
  }
}

export function scrollToDay(dayKey: string) {
  const element = dayScrollRefs.get(dayKey);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Highlight the day briefly
    element.style.transition = 'all 0.3s ease';
    element.style.transform = 'translateX(8px)';
    setTimeout(() => {
      element.style.transform = 'translateX(0)';
    }, 300);
  }
}

interface ThoughtStackProps {
  onDaysListToggle?: (isOpen: boolean) => void;
}

export function ThoughtStack({ onDaysListToggle }: ThoughtStackProps = {}) {
  const getDayThreads = useWorkspaceStore((state) => state.getDayThreads);
  const dayThreads = getDayThreads();
  const [isDaysListOpen, setIsDaysListOpen] = useState(false);

  const handleToggleDaysList = () => {
    const newState = !isDaysListOpen;
    setIsDaysListOpen(newState);
    onDaysListToggle?.(newState);
  };

  if (dayThreads.length === 0) {
    return null;
  }

  return (
    <>
      <div className={cn(
        "thought-stack",
        "w-full max-w-2xl mx-auto",
        "space-y-10" // Generous spacing between days
      )}>
        {/* Days List Toggle Button - positioned at the top of the stack */}
        <div className="flex justify-end mb-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleDaysList();
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full",
              "text-sm font-medium transition-all duration-200",
              "hover:scale-105 active:scale-95"
            )}
            style={{ 
              color: '#3D3833',
              background: '#F5F0EB',
              boxShadow: `
                2px 2px 6px rgba(180, 165, 145, 0.15),
                -2px -2px 6px rgba(255, 255, 255, 0.7)
              `
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#EAE5E0';
              e.currentTarget.style.boxShadow = `
                3px 3px 8px rgba(180, 165, 145, 0.2),
                -3px -3px 8px rgba(255, 255, 255, 0.8)
              `;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F5F0EB';
              e.currentTarget.style.boxShadow = `
                2px 2px 6px rgba(180, 165, 145, 0.15),
                -2px -2px 6px rgba(255, 255, 255, 0.7)
              `;
            }}
            title="View all days"
          >
            <Calendar className="w-4 h-4" />
            <span>All Days</span>
          </button>
        </div>

        {dayThreads.map((thread, index) => (
          <DayThread
            key={thread.day_key}
            thread={thread}
            isFirst={index === 0}
          />
        ))}
      </div>

      {/* Days List Sidebar */}
      <DaysList
        isOpen={isDaysListOpen}
        onClose={() => {
          setIsDaysListOpen(false);
          onDaysListToggle?.(false);
        }}
      />
    </>
  );
}
