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
  ({ className, title, subtitle, icon: Icon, iconColor = 'text-[#00D9FF]', action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base glass card styling
          'relative rounded-2xl backdrop-blur-xl',
          'bg-white/[0.06] border border-white/[0.1]',
          'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]',
          'shadow-[0_12px_24px_-8px_rgba(0,0,0,0.2)]',
          'transition-all duration-300',
          'hover:bg-white/[0.08] hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.25)]',
          className
        )}
        {...props}
      >
        {(title || Icon || action) && (
          <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full',
                  'bg-white/[0.05] shadow-[inset_0_1px_2px_0_rgba(0,0,0,0.1)]',
                  iconColor
                )}>
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <div>
                {title && (
                  <h3 className="text-sm font-semibold text-white/90">{title}</h3>
                )}
                {subtitle && (
                  <p className="text-xs text-white/50 mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            {action && <div>{action}</div>}
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
