/**
 * Pillar #1: Empty Workspace State
 * 
 * Minimal first-time experience.
 * No onboarding, no tutorials - just an invitation to think.
 */

import { cn } from '@/lib/utils';

interface EmptyWorkspaceProps {
  onStartThinking: () => void;
}

// PB Blue - represents active cognition
const PB_BLUE = '#489FE3';

export function EmptyWorkspace({ onStartThinking }: EmptyWorkspaceProps) {
  return (
    <div className={cn(
      "empty-workspace",
      "flex flex-col items-center justify-center",
      "min-h-[50vh] px-6"
    )}>
      <div className="text-center max-w-md">
        {/* Gentle invitation */}
        <h2 
          className="text-2xl font-medium mb-3"
          style={{ color: '#4A4540' }}
        >
          Your private thinking space
        </h2>
        
        <p 
          className="text-base mb-8"
          style={{ color: '#8A857D' }}
        >
          A quiet place to externalize thoughts. No audience, no pressure.
        </p>
        
        {/* Warm neumorphic button with PB blue accent - invitation to think */}
        <button
          onClick={onStartThinking}
          className="px-8 py-3 rounded-2xl font-medium transition-all duration-300 active:scale-[0.98]"
          style={{
            background: '#F0EBE6',
            color: PB_BLUE,
            boxShadow: `
              6px 6px 14px rgba(180, 165, 145, 0.3),
              -6px -6px 14px rgba(255, 255, 255, 0.85)
            `
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `
              8px 8px 18px rgba(180, 165, 145, 0.35),
              -8px -8px 18px rgba(255, 255, 255, 0.95),
              0 0 20px rgba(72, 159, 227, 0.15)
            `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `
              6px 6px 14px rgba(180, 165, 145, 0.3),
              -6px -6px 14px rgba(255, 255, 255, 0.85)
            `;
          }}
        >
          Start thinking
        </button>
      </div>
    </div>
  );
}
