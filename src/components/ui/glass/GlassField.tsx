import React from 'react';
import { cn } from '@/lib/utils';

interface GlassFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  as?: 'input' | 'textarea';
  error?: boolean;
}

export const GlassField = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, GlassFieldProps>(
  ({ className, as = 'input', error = false, ...props }, ref) => {
    const Component = as;
    
    return (
      <Component
        ref={ref as any}
        className={cn(
          // Base glass field styling - uses theme tokens
          'w-full px-4 py-3 rounded-2xl',
          'backdrop-blur-xl bg-[var(--glass-fill)] border border-[var(--glass-border)]',
          'text-[var(--card-fg)] placeholder:text-[var(--card-fg-muted)]',
          
          // Inner shadow for depth
          'shadow-[inset_0_1px_2px_0_rgba(0,0,0,0.05)]',
          
          // Focus states
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
          'focus:ring-[var(--card-ring)] focus:border-[var(--accent)]',
          'focus:shadow-[0_0_0_4px_var(--accent-glow)]',
          
          // Hover state
          'hover:bg-[var(--glass-elevated)] hover:border-[var(--accent)]/30',
          
          // Transition
          'transition-all duration-200',
          
          // Error state
          {
            'border-[hsl(var(--neon-red))]/50 focus:ring-[hsl(var(--neon-red))]/50 focus:border-[hsl(var(--neon-red))]/30': error,
          },
          
          // Textarea specific
          {
            'min-h-[120px] resize-y': as === 'textarea',
          },
          
          className
        )}
        {...props}
      />
    );
  }
);

GlassField.displayName = 'GlassField';
