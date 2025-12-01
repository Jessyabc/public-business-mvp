import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface GlassChipProps {
  label: string;
  removable?: boolean;
  onRemove?: () => void;
  glow?: boolean;
  className?: string;
}

export const GlassChip: React.FC<GlassChipProps> = ({ 
  label, 
  removable = false, 
  onRemove,
  glow = false,
  className 
}) => {
  return (
    <span
      className={cn(
        // Base chip styling - uses theme tokens
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
        'backdrop-blur-xl bg-[var(--glass-fill)] border border-[var(--glass-border)]',
        'text-xs font-medium text-[var(--card-fg)]',
        'shadow-[inset_0_1px_0_0_var(--glass-border)]',
        'transition-all duration-200',
        
        // Glow effect
        {
          'shadow-[0_0_12px_var(--accent-glow)] border-[var(--accent)]': glow,
        },
        
        className
      )}
    >
      {label}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-[var(--glass-elevated)] rounded-full p-0.5 transition-colors"
          type="button"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
