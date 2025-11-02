import { GlobalBackground } from '@/components/layout/GlobalBackground';
import { BrainstormMap } from '@/components/brainstorm/BrainstormMap';
import { RightSidebar } from '@/components/layout/RightSidebar';

/**
 * BrainstormFeed - Full-screen brainstorm visualization
 * 
 * Layout:
 * - Left: Hierarchical brainstorm map (1000px flex-2)
 * - Right: Sidebar with History + Open Ideas (500px flex-1)
 * - Background: Global orbital background (no duplication)
 */
export default function BrainstormFeed() {
  return (
    <>
      <GlobalBackground />
      
      <main className="relative h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 p-6 lg:p-8">
        {/* Left: Brainstorm Map */}
        <section 
          className="relative overflow-hidden"
          aria-label="Brainstorm visualization map"
        >
          <BrainstormMap />
        </section>

        {/* Right: Sidebar (History + Open Ideas) */}
        <aside 
          className="relative overflow-hidden"
          aria-label="Activity sidebar"
        >
          <RightSidebar variant="feed" />
        </aside>
      </main>
    </>
  );
}
