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
            'bg-gradient-to-br shadow-lg hover:shadow-xl active:scale-95': variant === 'primary',
            'from-[#00D9FF] to-[#00A3CC] text-white shadow-[0_0_24px_rgba(0,217,255,0.4)] hover:shadow-[0_0_32px_rgba(0,217,255,0.6)]': 
              variant === 'primary' && glow === 'aqua',
            'from-[#FF3B5C] to-[#CC2E49] text-white shadow-[0_0_24px_rgba(255,59,92,0.4)] hover:shadow-[0_0_32px_rgba(255,59,92,0.6)]': 
              variant === 'primary' && glow === 'red',
            'from-[#9D6CFF] to-[#7D4FCC] text-white shadow-[0_0_24px_rgba(157,108,255,0.4)] hover:shadow-[0_0_32px_rgba(157,108,255,0.6)]': 
              variant === 'primary' && glow === 'purple',
          },
          
          // Secondary variant (glass pill)
          {
            'backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] text-white/90 hover:bg-white/[0.12] active:scale-98':
              variant === 'secondary',
            'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.2)]':
              variant === 'secondary',
          },
          
          // Ghost variant
          {
            'text-white/70 hover:text-white hover:bg-white/[0.05] active:bg-white/[0.08]':
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
