import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Compass } from 'lucide-react';

interface BrainstormLayoutShellProps {
  main: ReactNode;
  crossLinks: ReactNode | null;
  sidebar: ReactNode;
  className?: string;
}

export function BrainstormLayoutShell({
  main,
  crossLinks,
  sidebar,
  className
}: BrainstormLayoutShellProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'sidebar'>('main');

  const tabs = [
    { id: 'main' as const, label: 'Feed', icon: Sparkles },
    { id: 'sidebar' as const, label: 'Trail', icon: Compass },
  ];

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Mobile Tabs - Enhanced visibility */}
      <div className="lg:hidden px-4 pt-3 pb-2">
        <div className="relative rounded-2xl bg-white/10 backdrop-blur-md p-1.5 border border-white/20 shadow-lg">
          {/* Sliding indicator */}
          <div 
            className={cn(
              "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl bg-white/20 backdrop-blur transition-transform duration-300 ease-out",
              "shadow-[0_0_15px_rgba(72,159,227,0.3)]",
              activeTab === 'sidebar' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'
            )}
          />
          
          <div className="relative grid grid-cols-2 gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button 
                  key={tab.id} 
                  type="button" 
                  onClick={() => setActiveTab(tab.id)} 
                  className={cn(
                    "relative z-10 flex items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                    isActive 
                      ? "text-white" 
                      : "text-white/50 hover:text-white/70"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive && "drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]")} />
                  <span className="uppercase tracking-[0.15em]">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop: 2-column layout */}
      <div className="hidden h-full min-h-0 gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] px-4 py-4">
        <div className="min-h-0">{main}</div>
        <div className="min-h-0">{sidebar}</div>
      </div>

      {/* Mobile: Tab-based layout */}
      <div className="flex-1 overflow-hidden lg:hidden">
        {activeTab === 'main' && <div className="h-full overflow-auto">{main}</div>}
        {activeTab === 'sidebar' && <div className="h-full overflow-auto p-4">{sidebar}</div>}
      </div>
    </div>
  );
}
