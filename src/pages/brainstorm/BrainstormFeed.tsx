import { GlobalBackground } from '@/components/layout/GlobalBackground';
import { BrainstormMap } from '@/components/brainstorm/BrainstormMap';
import { RightSidebar } from '@/components/layout/RightSidebar';

/**
 * BrainstormFeed - Full-screen brainstorm visualization
 * 
 * Layout:
 * - 100vh height, no scroll
 * - Two-column grid (2fr + 1fr)
 * - Global background remains visible
 * - Glass-styled panels with blur and transparency
 */
export default function BrainstormFeed() {
  return (
    <main className="relative h-screen w-full overflow-hidden grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 p-8 text-white">
      <GlobalBackground /> 
      
      <section className="relative flex items-center justify-center rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-inner overflow-hidden">
        <BrainstormMap />
      </section>

      <aside className="relative flex flex-col rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-inner overflow-hidden">
        <RightSidebar variant="feed" />
      </aside>
    </main>
  );
}
