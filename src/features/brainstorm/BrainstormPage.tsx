import { useEffect, useMemo } from 'react';
import { BrainstormSupabaseAdapter } from './adapters/supabaseAdapter';
import { useBrainstormStore } from './store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { NodeForm } from './components/NodeForm';

// --- Minimal, safe placeholders (replace with your real canvas/toolbar when ready) ---
function GraphCanvas() {
  const { nodes } = useBrainstormStore();
  if (!nodes.length) return null;

  return (
    <div className="rounded-xl border bg-card/50 p-4 min-h-[420px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {nodes.map((n) => (
        <Card key={n.id} className="glass-surface">
          <CardContent className="p-4">
            <div className="text-2xl">{n.emoji ?? '💡'}</div>
            <div className="font-semibold">{n.title}</div>
            {n.content && <div className="text-sm text-muted-foreground mt-1">{n.content}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Toolbar() {
  const { searchTerm, setSearchTerm } = useBrainstormStore();
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search ideas…"
          className="pl-8 glass-surface"
        />
      </div>
      <NodeForm
        trigger={
          <Button className="glass-button">
            + Idea
          </Button>
        }
      />
    </div>
  );
}
// --- end placeholders ---

function BrainstormPage() {
  const { setNodes, setEdges, nodes } = useBrainstormStore();

  const adapter = useMemo(() => new BrainstormSupabaseAdapter(), []);

  useEffect(() => {
    (async () => {
      try {
        const [n, e] = await Promise.all([adapter.loadNodes(), adapter.loadEdges()]);
        setNodes(n);
        setEdges(e);
      } catch (err) {
        console.error('Failed to load brainstorm data:', err);
        setNodes([]);
        setEdges([]);
      }
    })();
  }, [adapter, setNodes, setEdges]);

  const isEmpty = nodes.length === 0;

  return (
    <div className="flex">
      {/* Main content */}
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Brainstorm</h1>
          <Toolbar />
        </div>

        {isEmpty ? (
          <Card className="glass-surface">
            <CardContent className="p-6">
              <div className="text-base font-medium">No ideas yet</div>
              <div className="text-sm text-muted-foreground">
                Connect your backend to load nodes/edges, or enable writes later. For now this page
                runs in read-only UI mode.
              </div>
            </CardContent>
          </Card>
        ) : (
          <GraphCanvas />
        )}
      </div>

      {/* Right sidebar */}
      <RightSidebar />
    </div>
  );
}

// Export both default and named for compatibility
export { BrainstormPage };
export default BrainstormPage;
