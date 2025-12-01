import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, title, subtitle, icon: Icon, iconColor = 'text-[hsl(var(--neon-aqua))]', action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base glass card styling - uses theme tokens
          'relative rounded-2xl backdrop-blur-xl',
          'bg-[var(--card-bg)] border border-[var(--card-border)]',
          'shadow-[var(--card-shadow)]',
          'transition-all duration-300',
          'hover:bg-[var(--card-bg-hover)] hover:shadow-[var(--elevation-8)]',
          className
        )}
        {...props}
      >
        {(title || Icon || action) && (
          <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full',
                  'bg-[var(--glass-subtle)] shadow-[var(--elevation-1)]',
                  iconColor
                )}>
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <div>
                {title && (
                  <h3 className="text-sm font-semibold text-[var(--card-fg)]">{title}</h3>
                )}
                {subtitle && (
                  <p className="text-xs text-[var(--card-fg-muted)] mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            {action && <div>{action}</div>}
          </div>
        )}
        <div className="p-4 text-[var(--card-fg)]">
          {children}
        </div>
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
