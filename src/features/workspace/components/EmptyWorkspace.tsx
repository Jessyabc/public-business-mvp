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

export function EmptyWorkspace({ onStartThinking }: EmptyWorkspaceProps) {
  return (
    <div className={cn(
      "empty-workspace",
      "flex flex-col items-center justify-center",
      "min-h-[50vh] px-6"
    )}>
      <div className="text-center max-w-md">
        {/* Gentle invitation */}
        <h2 className={cn(
          "text-2xl font-medium mb-3",
          "text-[var(--text-primary)]"
        )}>
          Your private thinking space
        </h2>
        
        <p className={cn(
          "text-base mb-8",
          "text-[var(--text-secondary)]"
        )}>
          A quiet place to externalize thoughts. No audience, no pressure.
        </p>
        
        {/* Start button - calm, not urgent */}
        <button
          onClick={onStartThinking}
          className={cn(
            "px-8 py-3 rounded-xl",
            "bg-[var(--glass-bg)] backdrop-blur-lg",
            "border border-[var(--workspace-active-border)]",
            "text-[var(--text-primary)] font-medium",
            "shadow-[var(--workspace-active-glow)]",
            "hover:shadow-[0_0_30px_hsl(var(--workspace-focus)/0.25)]",
            "transition-all duration-300"
          )}
        >
          Start thinking
        </button>
      </div>
    </div>
  );
}
