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
          // Base glass field styling
          'w-full px-4 py-3 rounded-2xl',
          'backdrop-blur-xl bg-white/[0.05] border border-white/[0.12]',
          'text-white/90 placeholder:text-white/40',
          
          // Inner shadow for depth
          'shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.1)]',
          
          // Focus states
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
          'focus:ring-[#00D9FF]/50 focus:border-[#00D9FF]/30',
          'focus:shadow-[0_0_0_4px_rgba(0,217,255,0.1)]',
          
          // Hover state
          'hover:bg-white/[0.08] hover:border-white/[0.16]',
          
          // Transition
          'transition-all duration-200',
          
          // Error state
          {
            'border-red-400/50 focus:ring-red-400/50 focus:border-red-400/30': error,
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
