import { useEffect, useRef, useState, useCallback } from 'react';
import { ReactFlow, Node, Edge, Controls, Background, BackgroundVariant, useNodesState, useEdgesState, addEdge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import BrainstormNodeComponent from '@/components/BrainstormNode';
import ConnectionEdgeComponent from '@/components/ConnectionEdge';
import { useComposerStore } from '@/hooks/useComposerStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus, ToggleLeft } from 'lucide-react';
import { useAppMode } from '@/contexts/AppModeContext';
import { useNavigate } from 'react-router-dom';
import { BrainstormConnection } from '@/types/brainstorm';

const nodeTypes = {
  brainstorm: BrainstormNodeComponent,
};

const edgeTypes = {
  connection: ConnectionEdgeComponent,
};

export function BrainstormFeed() {
  const { posts, loading, fetchPosts } = usePosts();
  const { user } = useAuth();
  const { openComposer } = useComposerStore();
  const { toggleMode } = useAppMode();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const initialized = useRef(false);

  // Fetch brainstorm posts
  useEffect(() => {
    fetchPosts('public');
  }, []);

  // Convert posts to nodes and edges for the mindmap
  useEffect(() => {
    if (!initialized.current && posts.length > 0) {
      const brainstormPosts = posts.filter(post => post.type === 'brainstorm' && post.mode === 'public');
      
      if (brainstormPosts.length === 0) return;

      // Create nodes from posts in a radial/organic layout
      const newNodes: Node[] = brainstormPosts.map((post, index) => {
        const angle = (index / brainstormPosts.length) * 2 * Math.PI;
        const radius = 300 + (index % 3) * 200;
        const x = Math.cos(angle) * radius + 800 + (Math.random() - 0.5) * 100;
        const y = Math.sin(angle) * radius + 600 + (Math.random() - 0.5) * 100;

        return {
          id: post.id,
          type: 'brainstorm',
          position: { x, y },
          data: { 
            post,
            onContinue: () => openComposer({ 
              parentPostId: post.id, 
              relationType: 'continuation' 
            }),
            onLink: () => openComposer({ 
              parentPostId: post.id, 
              relationType: 'linking' 
            })
          },
          draggable: true,
        };
      });

      // Create edges to show connections between related posts
      const newEdges: Edge[] = [];
      brainstormPosts.forEach((post, index) => {
        // Connect to next post with some probability to create organic connections
        if (index < brainstormPosts.length - 1 && Math.random() > 0.4) {
          const connection: BrainstormConnection = {
            fromId: post.id,
            toId: brainstormPosts[index + 1].id,
            type: Math.random() > 0.5 ? 'inspiration' : 'continuation',
            strength: Math.random() * 0.5 + 0.5
          };
          
          newEdges.push({
            id: `e${post.id}-${brainstormPosts[index + 1].id}`,
            source: post.id,
            target: brainstormPosts[index + 1].id,
            type: 'connection',
            data: { connection },
            animated: true,
          });
        }
        
        // Occasionally connect to a random earlier post for web-like structure
        if (index > 1 && Math.random() > 0.7) {
          const targetIndex = Math.floor(Math.random() * index);
          const connection: BrainstormConnection = {
            fromId: post.id,
            toId: brainstormPosts[targetIndex].id,
            type: 'linking',
            strength: Math.random() * 0.3 + 0.2
          };
          
          newEdges.push({
            id: `e${post.id}-${brainstormPosts[targetIndex].id}`,
            source: post.id,
            target: brainstormPosts[targetIndex].id,
            type: 'connection',
            data: { connection },
            animated: false,
          });
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);
      initialized.current = true;
    }
  }, [posts, openComposer, setNodes, setEdges]);

  const handleConnect = useCallback((connection: Connection) => {
    if (!user) {
      toast.error("Please login to link brainstorms");
      return;
    }

    // Handle manual connections between nodes
    if (connection.source && connection.target) {
      const newConnection: BrainstormConnection = {
        fromId: connection.source,
        toId: connection.target,
        type: 'linking',
        strength: 0.8
      };

      const newEdge: Edge = {
        id: `e${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        type: 'connection',
        data: { connection: newConnection },
        animated: true,
      };

      setEdges((eds) => addEdge(newEdge, eds));
      
      // Open composer for the new connection
      openComposer({
        parentPostId: connection.target,
        relationType: 'linking'
      });
    }
  }, [user, setEdges, openComposer]);

  const handleCreateBrainstorm = () => {
    if (!user) {
      toast.error("Please login to create brainstorms");
      return;
    }
    openComposer({});
  };

  if (loading && posts.length === 0) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-4 text-blue-400 animate-pulse" />
          <div className="text-blue-200">Loading brainstorms...</div>
        </div>
      </div>
    );
  }

  const brainstormPosts = posts.filter(post => post.type === 'brainstorm' && post.mode === 'public');

  return (
    <div className="w-full h-screen relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Controls */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-white">Brainstorm Network</h1>
              <p className="text-sm text-blue-200">Explore connected ideas</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={toggleMode}
                variant="ghost"
                size="sm"
                className="text-blue-200 hover:text-white hover:bg-white/10"
              >
                <ToggleLeft className="w-4 h-4 mr-2" />
                Switch to Business
              </Button>
              <Button
                onClick={handleCreateBrainstorm}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </div>
          </div>
        </div>
      </div>

      {brainstormPosts.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center glass-card p-8 m-6">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <h3 className="text-xl font-medium text-white mb-2">No brainstorms yet</h3>
            <p className="text-blue-200 mb-6">Be the first to share an idea and start the network!</p>
            <Button onClick={handleCreateBrainstorm} className="bg-blue-600 hover:bg-blue-700">
              Start Your First Brainstorm
            </Button>
          </div>
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3, maxZoom: 1.2 }}
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
          style={{ 
            backgroundColor: 'transparent',
            width: '100%',
            height: '100%',
          }}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          selectNodesOnDrag={false}
        >
          <Background
            color="rgba(72, 159, 227, 0.15)" 
            gap={20} 
            size={1}
            variant={BackgroundVariant.Dots}
          />
          <Controls 
            className="bg-slate-800/90 backdrop-blur-xl border border-blue-400/30 rounded-lg shadow-lg"
            showZoom={true}
            showFitView={true}
            showInteractive={false}
          />
        </ReactFlow>
      )}
    </div>
  );
}