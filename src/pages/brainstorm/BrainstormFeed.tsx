import { useEffect, useState } from 'react';
import { GlobalBackground } from '@/components/layout/GlobalBackground';
import SpaceCanvas from '@/features/brainstorm/components/SpaceCanvas';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { useBrainstormStore } from '@/features/brainstorm/store';
import { getBrainstormGraph } from '@/features/brainstorm/adapters/supabaseAdapter';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import SoftLinksPanel from '@/features/brainstorm/components/SoftLinksPanel';

/**
 * BrainstormFeed - Full-screen brainstorm visualization
 * 
 * Layout:
 * - 100vh height, no scroll
 * - Three-column grid: Soft Links (left) + Canvas (center) + Activity (right)
 * - Global background remains visible
 * - Glass-styled panels with blur and transparency
 */
export default function BrainstormFeed() {
  const { setNodes, setEdges, nodes } = useBrainstormStore();
  const [isLoading, setIsLoading] = useState(true);

  const loadGraph = async () => {
    setIsLoading(true);
    try {
      const { nodes, edges } = await getBrainstormGraph();
      setNodes(nodes);
      setEdges(edges);
    } catch (error) {
      console.error('Failed to load brainstorm graph:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <GlobalBackground />
      
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 h-full py-8">
        <div className="grid grid-cols-12 gap-4 md:gap-6 lg:gap-8 h-full">
          {/* LEFT: Soft Links (sticky full height) */}
          <aside className="order-1 col-span-12 lg:col-span-3 xl:col-span-3 lg:sticky lg:top-16 self-start h-[calc(100vh-8rem)]">
            <SoftLinksPanel className="h-full" />
          </aside>

          {/* MIDDLE: Canvas */}
          <section className="order-2 col-span-12 lg:col-span-6 xl:col-span-6 relative flex flex-col rounded-3xl bg-background/5 backdrop-blur-md border border-foreground/10 shadow-inner overflow-hidden">
            {/* Header with refresh button */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                onClick={loadGraph}
                disabled={isLoading}
                size="sm"
                variant="secondary"
                className="bg-background/10 hover:bg-background/20 text-foreground border-foreground/20"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Canvas */}
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-foreground/70">Loading brainstorm space…</div>
              </div>
            ) : nodes.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-foreground/70">
                  <p className="text-lg mb-2">No brainstorms yet</p>
                  <p className="text-sm text-foreground/50">Create your first brainstorm to get started</p>
                </div>
              </div>
            ) : (
              <SpaceCanvas />
            )}
          </section>

          {/* RIGHT: Activity Sidebar */}
          <aside className="order-3 col-span-12 lg:col-span-3 xl:col-span-3 relative flex flex-col rounded-3xl bg-background/5 backdrop-blur-md border border-foreground/10 shadow-inner overflow-hidden">
            <RightSidebar variant="feed" />
          </aside>
        </div>
      </div>
    </main>
  );
}
