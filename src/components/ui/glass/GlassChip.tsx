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
        // Base chip styling
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
        'backdrop-blur-xl bg-white/[0.08] border border-white/[0.12]',
        'text-xs font-medium text-white/80',
        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]',
        'transition-all duration-200',
        
        // Glow effect
        {
          'shadow-[0_0_12px_rgba(0,217,255,0.3)] border-[#00D9FF]/30': glow,
        },
        
        className
      )}
    >
      {label}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-white/[0.1] rounded-full p-0.5 transition-colors"
          type="button"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
