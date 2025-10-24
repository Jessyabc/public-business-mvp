import React from 'react';
import { cn } from '@/lib/utils';

interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

export const GlassSurface = React.forwardRef<HTMLDivElement, GlassSurfaceProps>(
  ({ className, inset = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl',
          'bg-[var(--glass-bg)]',
          'border border-[var(--glass-border)]',
          'backdrop-blur-[var(--glass-blur)]',
          inset ? 'p-3 sm:p-4' : 'p-4 sm:p-6',
          className
        )}
        {...props}
      />
    );
  }
);

GlassSurface.displayName = 'GlassSurface';
