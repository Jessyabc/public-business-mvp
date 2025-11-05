import { useEffect, useState } from 'react';
import { GlobalBackground } from '@/components/layout/GlobalBackground';
import ThreadScroller from '@/features/brainstorm/components/ThreadScroller';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { useBrainstormStore } from '@/features/brainstorm/store';
import { getBrainstormGraph } from '@/features/brainstorm/adapters/supabaseAdapter';
import { GlowDefs } from '@/components/graphics/GlowDefs';
import { Loader2 } from 'lucide-react';

/**
 * BrainstormFeed - Infinite scroll feed with PB-glow lines and soft handoffs
 * 
 * Layout:
 * - 70% Thread feed (middle section)
 * - 30% Activity sidebar (right)
 * - No "hard link" corner box
 * - VisionOS-style corner glows on cards
 */
export default function BrainstormFeed() {
  const { setNodes, setEdges, nodes, selectById } = useBrainstormStore();
  const [isLoading, setIsLoading] = useState(true);

  const loadGraph = async () => {
    setIsLoading(true);
    try {
      const { nodes, edges } = await getBrainstormGraph();
      setNodes(nodes);
      setEdges(edges);
      
      // Set initial selected node to most recent
      if (nodes.length > 0) {
        const mostRecent = nodes.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        )[0];
        selectById(mostRecent.id);
      }
    } catch (error) {
      console.error('Failed to load brainstorm graph:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <GlobalBackground />
      <GlowDefs />
      
      <div className="grid grid-cols-[70%_30%] gap-0 h-screen">
        {/* Middle: Thread Feed (70%) */}
        <section className="relative overflow-hidden p-4 md:p-6">
          {nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-foreground/70">
                <p className="text-lg mb-2">No brainstorms yet</p>
                <p className="text-sm text-foreground/50">Create your first brainstorm to get started</p>
              </div>
            </div>
          ) : (
            <ThreadScroller />
          )}
        </section>

        {/* Right: Activity Sidebar (30%) */}
        <aside className="border-l border-border/50 bg-background/50 backdrop-blur-sm overflow-hidden">
          <RightSidebar variant="feed" />
        </aside>
      </div>
    </main>
  );
}
