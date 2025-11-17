import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BrainstormLayoutShellProps {
  lastSeen: ReactNode;
  main: ReactNode;
  sidebar: ReactNode;
  className?: string;
}

export function BrainstormLayoutShell({
  lastSeen,
  main,
  sidebar,
  className,
}: BrainstormLayoutShellProps) {
  const [activeTab, setActiveTab] = useState<'lastSeen' | 'main' | 'sidebar'>('main');

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Mobile Tabs */}
      <div className="lg:hidden">
        <div className="rounded-full bg-white/5 p-1 text-xs uppercase tracking-[0.3em] text-white/60">
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'lastSeen' as const, label: 'Last Seen' },
              { id: 'main' as const, label: 'Main' },
              { id: 'sidebar' as const, label: 'Sidebar' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs transition',
                  activeTab === tab.id
                    ? 'bg-white/90 text-black'
                    : 'text-white/70'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: 3-column layout */}
      <div className="hidden h-full min-h-0 gap-4 lg:grid lg:grid-cols-[minmax(220px,260px)_minmax(0,1fr)_minmax(220px,260px)]">
        <div className="min-h-0">{lastSeen}</div>
        <div className="min-h-0">{main}</div>
        <div className="min-h-0">{sidebar}</div>
      </div>

      {/* Mobile: Tab-based layout */}
      <div className="flex-1 overflow-hidden lg:hidden">
        {activeTab === 'lastSeen' && <div className="h-full overflow-auto">{lastSeen}</div>}
        {activeTab === 'main' && <div className="h-full overflow-auto">{main}</div>}
        {activeTab === 'sidebar' && <div className="h-full overflow-auto">{sidebar}</div>}
      </div>
    </div>
  );
}

