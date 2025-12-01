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
        // Glass container
        'relative rounded-[32px] backdrop-blur-2xl',
        'bg-white/[0.08] border border-white/[0.12]',
        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]',
        'shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)]',
        
        // Layout
        'flex items-center justify-around',
        'px-3 py-3',
        
        // Neon rim
        'before:absolute before:inset-0 before:rounded-[32px] before:p-[1px]',
        'before:bg-gradient-to-br before:from-[#00D9FF]/20 before:via-transparent before:to-[#9D6CFF]/20',
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
                ? 'bg-white/[0.12] text-white'
                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05]'
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-6 h-6" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#00D9FF] shadow-[0_0_8px_rgba(0,217,255,0.6)]" />
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
              'bg-gradient-to-br from-[#00D9FF] to-[#00A3CC]',
              'text-white shadow-[0_0_24px_rgba(0,217,255,0.5)]',
              'hover:shadow-[0_0_32px_rgba(0,217,255,0.7)]',
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
                ? 'bg-white/[0.12] text-white'
                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05]'
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-6 h-6" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#00D9FF] shadow-[0_0_8px_rgba(0,217,255,0.6)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
