import React from 'react';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

interface GlassNavBarProps {
  items: NavItem[];
  composeButton?: {
    onClick: () => void;
    icon: LucideIcon;
  };
  className?: string;
}

export const GlassNavBar: React.FC<GlassNavBarProps> = ({ 
  items, 
  composeButton,
  className 
}) => {
  const leftItems = items.slice(0, 2);
  const rightItems = items.slice(2);
  
  return (
    <nav className={cn(
      'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
      'w-[calc(100%-2rem)] max-w-md',
      className
    )}>
      <div className={cn(
        // Glass container - uses theme tokens
        'relative rounded-[32px] backdrop-blur-2xl',
        'bg-[var(--glass-fill)] border border-[var(--glass-border)]',
        'shadow-[var(--card-shadow)]',
        
        // Layout
        'flex items-center justify-around',
        'px-3 py-3',
        
        // Subtle accent rim
        'before:absolute before:inset-0 before:rounded-[32px] before:p-[1px]',
        'before:bg-gradient-to-br before:from-[var(--accent)]/15 before:via-transparent before:to-[var(--accent)]/10',
        'before:-z-10'
      )}>
        {/* Left items */}
        {leftItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-1 p-2.5 rounded-2xl',
              'transition-all duration-200 relative group',
              isActive
                ? 'bg-[var(--glass-elevated)] text-[var(--card-fg)]'
                : 'text-[var(--card-fg-muted)] hover:text-[var(--card-fg)] hover:bg-[var(--glass-subtle)]'
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-6 h-6" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--accent)] shadow-[var(--accent-glow)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
        
        {/* Center compose button */}
        {composeButton && (
          <button
            onClick={composeButton.onClick}
            className={cn(
              'relative w-14 h-14 rounded-full -mt-4',
              'bg-[var(--accent)] text-white',
              'shadow-[var(--accent-glow)]',
              'hover:shadow-[0_0_32px_var(--accent-glow)]',
              'active:scale-95 transition-all duration-200',
              
              // Inner glow
              'before:absolute before:inset-[2px] before:rounded-full',
              'before:bg-gradient-to-b before:from-white/20 before:to-transparent',
              'before:opacity-50'
            )}
          >
            <composeButton.icon className="w-7 h-7 relative z-10" />
          </button>
        )}
        
        {/* Right items */}
        {rightItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-1 p-2.5 rounded-2xl',
              'transition-all duration-200 relative group',
              isActive
                ? 'bg-[var(--glass-elevated)] text-[var(--card-fg)]'
                : 'text-[var(--card-fg-muted)] hover:text-[var(--card-fg)] hover:bg-[var(--glass-subtle)]'
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-6 h-6" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--accent)] shadow-[var(--accent-glow)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
