import { forwardRef, HTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, asChild = false, padding = 'md', interactive = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6 md:p-8',
      lg: 'p-8 md:p-12',
    };

    const baseClasses = cn(
      // Base card surface with proper contrast
      'rounded-2xl',
      'border border-[var(--card-border)]',
      'bg-[var(--card-bg)]',
      'text-[var(--card-fg)]',
      'shadow-[var(--card-shadow)]',
      'transition-colors duration-200',
      
      // Padding
      paddingClasses[padding],
      
      // Interactive states
      interactive && [
        'cursor-pointer',
        'hover:bg-[var(--card-bg-hover)]',
        'active:translate-y-px',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-[var(--card-ring)]',
        'focus-visible:ring-offset-2',
      ],
      
      className
    );

    return (
      <Comp
        ref={ref}
        className={baseClasses}
        {...props}
      />
    );
  }
);

GlassCard.displayName = 'GlassCard';