import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
interface BrainstormLayoutShellProps {
  main: ReactNode;
  crossLinks: ReactNode;
  sidebar: ReactNode;
  className?: string;
}
export function BrainstormLayoutShell({
  main,
  crossLinks,
  sidebar,
  className
}: BrainstormLayoutShellProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'crossLinks' | 'sidebar'>('main');
  return <div className={cn('flex h-full flex-col', className)}>
      {/* Mobile Tabs */}
      <div className="lg:hidden">
        <div className="rounded-full bg-white/5 p-1 text-xs uppercase tracking-[0.3em] text-white/60">
          <div className="grid grid-cols-3 gap-1">
            {[{
            id: 'main' as const,
            label: 'Main'
          }, {
            id: 'crossLinks' as const,
            label: 'Cross-links'
          }, {
            id: 'sidebar' as const,
            label: 'Sidebar'
          }].map(tab => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={cn('rounded-full px-2 py-1 text-xs transition', activeTab === tab.id ? 'bg-white/90 text-black' : 'text-white/70')}>
                {tab.label}
              </button>)}
          </div>
        </div>
      </div>

      {/* Desktop: 3-column layout */}
      <div className="hidden h-full min-h-0 gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(200px,240px)_minmax(200px,240px)] px-[10px] py-[10px]">
        <div className="min-h-0">{main}</div>
        <div className="min-h-0 px-[10px]">{crossLinks}</div>
        <div className="min-h-0">{sidebar}</div>
      </div>

      {/* Mobile: Tab-based layout */}
      <div className="flex-1 overflow-hidden lg:hidden">
        {activeTab === 'main' && <div className="h-full overflow-auto">{main}</div>}
        {activeTab === 'crossLinks' && <div className="h-full overflow-auto">{crossLinks}</div>}
        {activeTab === 'sidebar' && <div className="h-full overflow-auto">{sidebar}</div>}
      </div>
    </div>;
}