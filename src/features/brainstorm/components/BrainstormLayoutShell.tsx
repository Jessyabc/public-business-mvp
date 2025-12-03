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
      {/* Mobile Tabs - Polished */}
      <div className="lg:hidden px-4 pt-2">
        <div className="relative rounded-full bg-white/5 backdrop-blur-sm p-1 border border-white/10">
          {/* Sliding indicator */}
          <div 
            className={cn(
              "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white/15 backdrop-blur transition-transform duration-300 ease-out",
              activeTab === 'sidebar' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
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
                    "relative z-10 flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors duration-200",
                    isActive 
                      ? "text-white" 
                      : "text-white/50 hover:text-white/70"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="uppercase tracking-[0.2em]">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop: 2-column layout */}
      <div className="hidden h-full min-h-0 gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(200px,260px)] px-[10px] py-[10px]">
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
