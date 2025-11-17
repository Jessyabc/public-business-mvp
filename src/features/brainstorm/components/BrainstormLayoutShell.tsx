import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type Props = {
  leftColumn: React.ReactNode;
  centerColumn: React.ReactNode;
  rightColumn: React.ReactNode;
};

const MOBILE_TABS = [
  { value: 'last', label: 'Last Seen' },
  { value: 'main', label: 'Main Feed' },
  { value: 'links', label: 'Cross-links' },
];

/**
 * BrainstormLayoutShell
 * ---------------------
 * Shared responsive frame for the /brainstorm page.
 * - Desktop: 3 columns + persistent bottom padding (for global bottom bar)
 * - Mobile: collapses columns into tabbed panels
 */
export function BrainstormLayoutShell({ leftColumn, centerColumn, rightColumn }: Props) {
  const [activeTab, setActiveTab] = useState<'last' | 'main' | 'links'>('main');

  return (
    <div className="relative w-full min-h-[calc(100vh-5rem)] pb-24">
      {/* Mobile tabbed layout */}
      <div className="md:hidden px-4 space-y-4">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)}>
          <TabsList className="grid grid-cols-3">
            {MOBILE_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="last" className="mt-4">
            {leftColumn}
          </TabsContent>
          <TabsContent value="main" className="mt-4">
            {centerColumn}
          </TabsContent>
          <TabsContent value="links" className="mt-4">
            {rightColumn}
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop 3-column layout */}
      <div
        className={cn(
          'hidden md:grid',
          'grid-cols-[minmax(240px,320px)_minmax(0,1fr)_minmax(260px,360px)]',
          'gap-4 px-6 h-[calc(100vh-6rem)]'
        )}
      >
        <section className="h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
          {leftColumn}
        </section>
        <section className="h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
          {centerColumn}
        </section>
        <section className="h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
          {rightColumn}
        </section>
      </div>
    </div>
  );
}
