import { forwardRef, HTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { useUIModeStore } from '@/stores/uiModeStore';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, asChild = false, padding = 'md', hover = true, ...props }, ref) => {
    const { uiMode } = useUIModeStore();
    const Comp = asChild ? Slot : 'div';

    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const baseClasses = cn(
      // Base glass effect
      'relative overflow-hidden',
      'backdrop-blur-[20px] backdrop-saturate-150',
      'rounded-2xl',
      'transition-all duration-300 ease-out',
      
      // Mode-specific styling
      uiMode === 'public' 
        ? 'glass-card' // Uses existing CSS class for public mode
        : 'glass-business-card', // Uses existing CSS class for business mode
      
      // Padding
      paddingClasses[padding],
      
      // Hover effects
      hover && 'cursor-pointer',
      
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