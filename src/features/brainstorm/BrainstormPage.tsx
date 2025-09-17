import { useEffect, useMemo, useState } from 'react';
import { BrainstormSupabaseAdapter } from './adapters/supabaseAdapter';
import { useBrainstormStore } from './store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowLeft } from 'lucide-react';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { NodeForm } from './components/NodeForm';
import { PostModal } from '@/components/post/PostModal';
import { rpcTrackEvent } from '@/integrations/supabase/rpc';

// --- Depth-enabled GraphCanvas with 2.5D parallax ---
function GraphCanvas() {
  const { nodes, depth, selectedNodeId, setDepth, setSelectedNodeId } = useBrainstormStore();

  const handleNodeClick = async (nodeId: string) => {
    if (depth === 0) {
      // Focus on node (depth 1)
      setSelectedNodeId(nodeId);
      setDepth(1);
      await trackNodeEvent('focus_node', nodeId);
    } else if (depth === 1 && selectedNodeId === nodeId) {
      // Drill into node (depth 2)
      setDepth(2);
      await trackNodeEvent('open_node', nodeId);
    }
  };

  const trackNodeEvent = async (event: string, nodeId: string) => {
    try {
      await rpcTrackEvent(event, nodeId, 'brainstorm', {
        depth,
        timestamp: Date.now()
      });
    } catch (error) {
      console.warn('Failed to track node event:', error);
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!nodes.length) return null;

  // Depth 0: Overview
  if (depth === 0) {
    return (
      <div className="rounded-xl border bg-card/50 p-4 min-h-[420px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
        {nodes.map((node) => (
          <Card 
            key={node.id} 
            className="glass-surface hover-scale cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
            onClick={() => handleNodeClick(node.id)}
          >
            <CardContent className="p-4">
              <div className="text-2xl mb-2">{node.emoji ?? '💡'}</div>
              <div className="font-semibold mb-1">{node.title}</div>
              {node.content && (
                <div className="text-sm text-muted-foreground line-clamp-2">{node.content}</div>
              )}
              {node.tags && node.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {node.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Depth 1: Focus with parallax blur
  if (depth === 1 && selectedNode) {
    return (
      <div className="relative min-h-[420px] flex items-center justify-center animate-scale-in">
        {/* Background nodes with blur and parallax */}
        <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 blur-sm opacity-30 scale-95">
          {nodes.filter(n => n.id !== selectedNodeId).map((node) => (
            <Card key={node.id} className="glass-surface">
              <CardContent className="p-4">
                <div className="text-2xl">{node.emoji ?? '💡'}</div>
                <div className="font-semibold">{node.title}</div>
                {node.content && <div className="text-sm text-muted-foreground">{node.content}</div>}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Focused node with halo effect */}
        <Card 
          className="relative z-10 glass-surface border-primary/50 shadow-xl shadow-primary/30 max-w-md cursor-pointer transform scale-110 animate-pulse"
          onClick={() => handleNodeClick(selectedNode.id)}
        >
          <CardContent className="p-6">
            <div className="text-4xl mb-3 text-center">{selectedNode.emoji ?? '💡'}</div>
            <div className="font-bold text-lg text-center mb-2">{selectedNode.title}</div>
            {selectedNode.content && (
              <div className="text-sm text-muted-foreground text-center">{selectedNode.content}</div>
            )}
            {selectedNode.tags && selectedNode.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {selectedNode.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="text-xs text-center text-muted-foreground mt-4">
              Click to drill in
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

function Toolbar() {
  const { searchTerm, setSearchTerm, depth, setDepth, setSelectedNodeId } = useBrainstormStore();
  
  const handleBack = () => {
    if (depth === 2) {
      setDepth(1);
    } else if (depth === 1) {
      setDepth(0);
      setSelectedNodeId(null);
    }
    // Update URL
    updateURL();
  };

  const updateURL = () => {
    const url = new URL(window.location.href);
    if (depth === 0) {
      url.hash = '';
    }
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div className="flex items-center gap-2">
      {depth > 0 && (
        <Button variant="ghost" size="sm" onClick={handleBack} className="glass-button">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      )}
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

function BrainstormPage() {
  const { 
    setNodes, 
    setEdges, 
    nodes, 
    depth, 
    selectedNodeId, 
    setDepth, 
    setSelectedNodeId 
  } = useBrainstormStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const adapter = useMemo(() => new BrainstormSupabaseAdapter(), []);

  // Handle URL deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const params = new URLSearchParams(hash);
      const nodeId = params.get('node');
      const depthParam = params.get('d');
      
      if (nodeId && nodes.find(n => n.id === nodeId)) {
        setSelectedNodeId(nodeId);
        if (depthParam === '1') setDepth(1);
        else if (depthParam === '2') setDepth(2);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check initial URL
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [nodes, setSelectedNodeId, setDepth]);

  // Update URL when depth/selection changes
  useEffect(() => {
    if (depth === 0) {
      window.history.replaceState({}, '', window.location.pathname);
    } else if (depth === 1 && selectedNodeId) {
      window.history.replaceState({}, '', `${window.location.pathname}#node=${selectedNodeId}&d=1`);
    } else if (depth === 2 && selectedNodeId) {
      window.history.replaceState({}, '', `${window.location.pathname}#node=${selectedNodeId}&d=2`);
      setIsModalOpen(true);
    }
  }, [depth, selectedNodeId]);

  // Close modal when depth changes from 2
  useEffect(() => {
    if (depth !== 2) {
      setIsModalOpen(false);
    }
  }, [depth]);

  useEffect(() => {
    (async () => {
      try {
        // Load nodes first
        const nodes = await adapter.loadNodes();
        setNodes(nodes);
        
        // Then load edges for these nodes
        if (nodes.length > 0) {
          const nodeIds = nodes.map(node => node.id);
          const edges = await adapter.loadEdgesForNodes(nodeIds);
          setEdges(edges);
        } else {
          setEdges([]);
        }
      } catch (err) {
        console.error('Failed to load brainstorm data:', err);
        setNodes([]);
        setEdges([]);
      }
    })();
  }, [adapter, setNodes, setEdges]);

  const isEmpty = nodes.length === 0;
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex">
      {/* Main content */}
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            Brainstorm {depth > 0 && selectedNode && `• ${selectedNode.title}`}
          </h1>
          <Toolbar />
        </div>

        {isEmpty ? (
          <Card className="glass-surface">
            <CardContent className="p-6">
              <div className="text-base font-medium">No ideas yet</div>
              <div className="text-sm text-muted-foreground">
                Create your first brainstorm idea to get started with the interactive canvas.
              </div>
            </CardContent>
          </Card>
        ) : (
          <GraphCanvas />
        )}
      </div>

      {/* Right sidebar */}
      <RightSidebar />

      {/* Post Modal */}
      {selectedNode && (
        <PostModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setDepth(1);
          }}
          id={selectedNode.id}
          type="brainstorm"
          title={selectedNode.title}
          content={selectedNode.content}
          author={selectedNode.author}
          created_at={selectedNode.created_at}
          emoji={selectedNode.emoji}
          tags={selectedNode.tags}
        />
      )}
    </div>
  );
}

// Export both default and named for compatibility
export { BrainstormPage };
export default BrainstormPage;
