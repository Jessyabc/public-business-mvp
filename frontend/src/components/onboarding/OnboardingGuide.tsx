/**
 * Onboarding Guide Component
 * Displays contextual hints in a non-intrusive popover
 */

import { useEffect, useRef } from 'react';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OnboardingArea } from './onboardingAreas';

interface OnboardingGuideProps {
  area: OnboardingArea;
  open: boolean;
  onClose: () => void;
  targetElement?: HTMLElement | null;
}

// PB Blue for accents
const PB_BLUE = '#489FE3';

export function OnboardingGuide({ area, open, onClose, targetElement }: OnboardingGuideProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Auto-close on escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Styles based on area style
  const getStyleClasses = () => {
    switch (area.style) {
      case 'neumorphic':
        return {
          container: 'bg-[#F0EBE6] border-[#D4C9BC]',
          title: 'text-[#4A4540]',
          description: 'text-[#8A857D]',
          hint: 'text-[#6B635B]',
          button: 'bg-[#EAE5E0] text-[#489FE3] hover:bg-[#E0DBD6]',
        };
      case 'glass':
        return {
          container: 'bg-white/10 backdrop-blur-xl border-white/20',
          title: 'text-white',
          description: 'text-white/80',
          hint: 'text-white/70',
          button: 'bg-white/15 text-white hover:bg-white/25',
        };
      default: // neutral
        return {
          container: 'bg-popover border-border',
          title: 'text-foreground',
          description: 'text-muted-foreground',
          hint: 'text-muted-foreground',
          button: 'bg-primary text-primary-foreground hover:bg-primary/90',
        };
    }
  };

  const styles = getStyleClasses();

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        onClose();
      }
    }}>
      <PopoverContent
        ref={popoverRef}
        className={cn(
          'w-80 p-5 shadow-lg',
          styles.container,
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
        side="top"
        align="center"
        sideOffset={12}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={cn('font-semibold text-lg mb-1', styles.title)}>
                {area.title}
              </h3>
              <p className={cn('text-sm leading-relaxed', styles.description)}>
                {area.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className={cn(
                'ml-2 p-1 rounded-md transition-colors',
                'hover:bg-black/5 dark:hover:bg-white/5',
                styles.hint
              )}
              aria-label="Close guide"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Hints */}
          <ul className="space-y-2 pt-2">
            {area.hints.map((hint, index) => (
              <li key={index} className={cn('text-sm flex items-start gap-2', styles.hint)}>
                <span className="mt-0.5">•</span>
                <span>{hint}</span>
              </li>
            ))}
          </ul>

          {/* Action Button */}
          <div className="pt-2">
            <Button
              onClick={onClose}
              className={cn('w-full', styles.button)}
              size="sm"
            >
              Got it
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
