import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GraphCanvas } from './components/GraphCanvas';
import { Toolbar } from './components/Toolbar';
import { NodeForm } from './components/NodeForm';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { useBrainstormStore } from './store';
import { BrainstormSupabaseAdapter } from './adapters/supabaseAdapter';

export default function BrainstormPage() {
  const { setNodes, setEdges } = useBrainstormStore();
  const adapter = new BrainstormSupabaseAdapter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [nodes, edges] = await Promise.all([
          adapter.loadNodes(),
          adapter.loadEdges(),
        ]);
        setNodes(nodes);
        setEdges(edges);
      } catch (error) {
        console.error('Failed to load brainstorm data:', error);
      }
    };

    loadData();
  }, [setNodes, setEdges]);

  return (
    <div className="h-screen flex bg-gradient-to-br from-background via-background/95 to-muted/20">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Toolbar />
        <div className="flex-1 p-4">
          <GraphCanvas />
        </div>
      </div>

      {/* Right Sidebar */}
      <RightSidebar />

      {/* Floating Add Button for Mobile */}
      <NodeForm
        trigger={
          <Button 
            size="lg"
            className="md:hidden fixed bottom-20 right-4 z-50 rounded-full w-14 h-14 shadow-lg glass-button"
          >
            <Plus className="w-6 h-6" />
          </Button>
        }
      />
    </div>
  );
}