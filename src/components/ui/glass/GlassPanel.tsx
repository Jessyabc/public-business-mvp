import React from 'react';
import { cn } from '@/lib/utils';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle';
  neonAccent?: 'aqua' | 'purple' | 'red' | 'none';
  children: React.ReactNode;
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant = 'default', neonAccent = 'aqua', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base glass styling
          'relative rounded-[28px] backdrop-blur-2xl',
          'bg-white/[0.08] border border-white/[0.12]',
          
          // Inner shadow for depth
          'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]',
          
          // Outer shadow for floating effect
          'shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)]',
          
          // Variant styles
          {
            'bg-white/[0.08]': variant === 'default',
            'bg-white/[0.12] shadow-[0_24px_48px_-16px_rgba(0,0,0,0.35)]': variant === 'elevated',
            'bg-white/[0.05]': variant === 'subtle',
          },
          
          // Neon accent glow
          {
            'before:absolute before:inset-0 before:rounded-[28px] before:p-[1px] before:bg-gradient-to-br before:from-[#00D9FF]/30 before:via-transparent before:to-[#00D9FF]/10 before:-z-10': 
              neonAccent === 'aqua',
            'before:absolute before:inset-0 before:rounded-[28px] before:p-[1px] before:bg-gradient-to-br before:from-[#9D6CFF]/30 before:via-transparent before:to-[#9D6CFF]/10 before:-z-10': 
              neonAccent === 'purple',
            'before:absolute before:inset-0 before:rounded-[28px] before:p-[1px] before:bg-gradient-to-br before:from-[#FF3B5C]/30 before:via-transparent before:to-[#FF3B5C]/10 before:-z-10': 
              neonAccent === 'red',
          },
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = 'GlassPanel';
