/**
 * Pillar #1: Thought Stack
 * 
 * Displays day threads - groups of thoughts organized by day.
 * Most recent day first, with ability to add to any previous day.
 * Includes OpenCircle at the end for chain continuation/breaking.
 */

import { useState, useCallback } from 'react';
import { useWorkspaceStore } from '../useWorkspaceStore';
import { useChainStore } from '../stores/chainStore';
import { useAuth } from '@/contexts/AuthContext';
import { DayThread } from './DayThread';
import { DaysList } from './DaysList';
import { OpenCircle } from './OpenCircle';
import { ChainThread } from './ChainThread';
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
  onContinue?: () => void;
}

export function ThoughtStack({ onDaysListToggle, onContinue }: ThoughtStackProps = {}) {
  const getDayThreads = useWorkspaceStore((state) => state.getDayThreads);
  const { user } = useAuth();
  const { breakChain, activeChainId } = useChainStore();
  const dayThreads = getDayThreads();
  const [isDaysListOpen, setIsDaysListOpen] = useState(false);

  const handleToggleDaysList = () => {
    const newState = !isDaysListOpen;
    setIsDaysListOpen(newState);
    onDaysListToggle?.(newState);
  };

  // Handle break chain gesture - creates new chain
  const handleBreakChain = useCallback(() => {
    if (user) {
      breakChain(user.id);
    }
  }, [user, breakChain]);

  // Handle continue chain - delegate to parent
  const handleContinue = useCallback(() => {
    onContinue?.();
  }, [onContinue]);

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
        
        {/* OpenCircle at the end of the stack - continuation point */}
        <div className="flex justify-center pt-6 pb-8">
          <ChainThread showLine={true}>
            <OpenCircle
              onContinue={handleContinue}
              onBreak={handleBreakChain}
              size="md"
            />
          </ChainThread>
        </div>
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
