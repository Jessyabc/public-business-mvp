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
          // Base glass styling - uses theme tokens
          'relative rounded-[28px] backdrop-blur-2xl',
          'bg-[var(--glass-fill)] border border-[var(--glass-border)]',
          
          // Inner shadow for depth
          'shadow-[inset_0_1px_0_0_var(--glass-border)]',
          
          // Outer shadow for floating effect
          'shadow-[var(--card-shadow)]',
          
          // Variant styles
          {
            'bg-[var(--glass-fill)]': variant === 'default',
            'bg-[var(--glass-elevated)] shadow-[var(--elevation-8)]': variant === 'elevated',
            'bg-[var(--glass-subtle)]': variant === 'subtle',
          },
          
          // Neon accent glow - subtle for professional theme
          {
            'before:absolute before:inset-0 before:rounded-[28px] before:p-[1px] before:bg-gradient-to-br before:from-[hsl(var(--neon-aqua))]/20 before:via-transparent before:to-[hsl(var(--neon-aqua))]/10 before:-z-10': 
              neonAccent === 'aqua',
            'before:absolute before:inset-0 before:rounded-[28px] before:p-[1px] before:bg-gradient-to-br before:from-[var(--accent)]/20 before:via-transparent before:to-[var(--accent)]/10 before:-z-10': 
              neonAccent === 'purple',
            'before:absolute before:inset-0 before:rounded-[28px] before:p-[1px] before:bg-gradient-to-br before:from-[hsl(var(--neon-red))]/20 before:via-transparent before:to-[hsl(var(--neon-red))]/10 before:-z-10': 
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
