import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  glow?: 'aqua' | 'red' | 'purple' | 'none';
  loading?: boolean;
  children: React.ReactNode;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ 
    className, 
    variant = 'secondary', 
    size = 'md', 
    glow = 'aqua',
    loading = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center font-medium',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          
          // Size variants
          {
            'px-4 py-2 text-sm rounded-full': size === 'sm',
            'px-6 py-3 text-base rounded-full': size === 'md',
            'px-8 py-4 text-lg rounded-full': size === 'lg',
            'w-12 h-12 rounded-full': size === 'icon',
          },
          
          // Primary variant (glowing circular button)
          {
            'shadow-lg hover:shadow-xl active:scale-95': variant === 'primary',
            'bg-[hsl(var(--neon-aqua))] text-white shadow-[0_0_20px_hsla(var(--neon-aqua),0.3)] hover:shadow-[0_0_28px_hsla(var(--neon-aqua),0.5)]': 
              variant === 'primary' && glow === 'aqua',
            'bg-[hsl(var(--neon-red))] text-white shadow-[0_0_20px_hsla(var(--neon-red),0.3)] hover:shadow-[0_0_28px_hsla(var(--neon-red),0.5)]': 
              variant === 'primary' && glow === 'red',
            'bg-[var(--accent)] text-white shadow-[0_0_20px_hsla(var(--accent),0.3)] hover:shadow-[0_0_28px_hsla(var(--accent),0.5)]': 
              variant === 'primary' && glow === 'none',
          },
          
          // Secondary variant (glass pill) - uses theme tokens
          {
            'backdrop-blur-xl bg-[var(--glass-fill)] border border-[var(--glass-border)] text-[var(--card-fg)] hover:bg-[var(--glass-elevated)] active:scale-98':
              variant === 'secondary',
            'shadow-[inset_0_1px_0_0_var(--glass-border)] shadow-[0_4px_12px_-2px_rgba(0,0,0,0.1)]':
              variant === 'secondary',
          },
          
          // Ghost variant
          {
            'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-subtle)] active:bg-[var(--glass-fill)]':
              variant === 'ghost',
          },
          
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
