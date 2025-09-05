import { useEffect, useRef, useState, useCallback } from 'react';
import { ReactFlow, Node, Edge, Controls, Background, BackgroundVariant, useNodesState, useEdgesState, addEdge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '@xyflow/react/dist/base.css';
import '../../styles/react-flow-turbo.css';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import BrainstormNodeComponent, { BrainstormNodeData } from '@/components/BrainstormNode';
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
  const [selectedSubflow, setSelectedSubflow] = useState<string | null>(null);
  const [subflowDepth, setSubflowDepth] = useState(0);
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
            }),
            onExpandSubflow: () => handleExpandSubflow(post.id),
            subflowDepth: 0,
            hasSubflows: posts.some(p => p.metadata?.parentId === post.id)
          },
          draggable: true,
          className: 'animate-fade-in',
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

  const handleExpandSubflow = useCallback((postId: string) => {
    setSelectedSubflow(selectedSubflow === postId ? null : postId);
    
    if (selectedSubflow !== postId) {
      // Find continuation posts for this brainstorm
      const continuationPosts = posts.filter(p => p.metadata?.parentId === postId);
      
      if (continuationPosts.length > 0) {
        // Create subflow nodes arranged in a hierarchical layout
        const subflowNodes: Node[] = continuationPosts.map((post, index) => {
          const parentNode = nodes.find(n => n.id === postId);
          if (!parentNode) return null;
          
          const offsetX = (index % 3) * 200 - 200;
          const offsetY = Math.floor(index / 3) * 150 + 200;
          
          return {
            id: `${postId}-subflow-${post.id}`,
            type: 'brainstorm',
            position: { 
              x: parentNode.position.x + offsetX, 
              y: parentNode.position.y + offsetY 
            },
            data: { 
              post,
              subflowDepth: 1,
              parentId: postId,
              onContinue: () => openComposer({ 
                parentPostId: post.id, 
                relationType: 'continuation' 
              }),
            },
            draggable: true,
            className: 'animate-scale-in',
          };
        }).filter(Boolean) as Node[];
        
         // Create connecting edges from parent to subflow nodes
         const subflowEdges: Edge[] = subflowNodes.map(node => ({
           id: `edge-${postId}-${node.id}`,
           source: postId,
           target: node.id,
           type: 'connection',
           data: { 
             connection: {
               fromId: postId,
               toId: (node.data as BrainstormNodeData).post.id,
               type: 'continuation' as const,
               strength: 0.9
             }
           },
           animated: true,
           className: 'animate-fade-in',
         }));
        
        setNodes(prev => [...prev, ...subflowNodes]);
        setEdges(prev => [...prev, ...subflowEdges]);
        setSubflowDepth(1);
      }
    } else {
      // Collapse subflow - remove subflow nodes and edges
      setNodes(prev => prev.filter(node => !node.id.includes(`${postId}-subflow`)));
      setEdges(prev => prev.filter(edge => !edge.id.includes(`edge-${postId}`)));
      setSubflowDepth(0);
    }
  }, [selectedSubflow, posts, nodes, openComposer, setNodes, setEdges]);

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
    <div className="w-full h-screen relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16">
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
          className="react-flow-turbo"
          colorMode="dark"
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