import { useEffect, useState } from 'react';
import { GlobalBackground } from '@/components/layout/GlobalBackground';
import SpaceCanvas from '@/features/brainstorm/components/SpaceCanvas';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { useBrainstormStore } from '@/features/brainstorm/store';
import { getBrainstormGraph } from '@/features/brainstorm/adapters/supabaseAdapter';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

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
    <main className="relative h-screen w-full overflow-hidden grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 p-8 text-white">
      <GlobalBackground /> 
      
      <section className="relative flex flex-col rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-inner overflow-hidden">
        {/* Header with refresh button */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={loadGraph}
            disabled={isLoading}
            size="sm"
            variant="secondary"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Canvas */}
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/70">Loading brainstorm space…</div>
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white/70">
              <p className="text-lg mb-2">No brainstorms yet</p>
              <p className="text-sm text-white/50">Create your first brainstorm to get started</p>
            </div>
          </div>
        ) : (
          <SpaceCanvas />
        )}
      </section>

      <aside className="relative flex flex-col rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-inner overflow-hidden">
        <RightSidebar variant="feed" />
      </aside>
    </main>
  );
}
