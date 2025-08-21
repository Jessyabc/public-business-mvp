import { useEffect, useRef, useState } from 'react';
import { ReactFlow, Node, Edge, Controls, Background, BackgroundVariant, useNodesState, useEdgesState, addEdge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import BrainstormNodeComponent from '@/components/BrainstormNode';
import ConnectionEdgeComponent from '@/components/ConnectionEdge';
import { useComposerStore } from '@/hooks/useComposerStore';
import { toast } from 'sonner';

const nodeTypes = {
  brainstorm: BrainstormNodeComponent,
};

const edgeTypes = {
  connection: ConnectionEdgeComponent,
};

export function BrainstormFeed() {
  const { posts, loading, fetchPosts, createPostWithRelation } = usePosts();
  const { user } = useAuth();
  const { openComposer } = useComposerStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const initialized = useRef(false);

  // Fetch brainstorm posts
  useEffect(() => {
    fetchPosts('public');
  }, []);

  // Convert posts to nodes and edges
  useEffect(() => {
    if (!initialized.current && posts.length > 0) {
      const brainstormPosts = posts.filter(post => post.type === 'brainstorm');
      
      // Create nodes from posts
      const newNodes: Node[] = brainstormPosts.map((post, index) => ({
        id: post.id,
        type: 'brainstorm',
        position: { 
          x: (index % 5) * 320 + Math.random() * 50, 
          y: Math.floor(index / 5) * 280 + Math.random() * 50 
        },
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
      }));

      // Create edges from post relations - this would need to be implemented based on your post_relations table
      const newEdges: Edge[] = [];

      setNodes(newNodes);
      setEdges(newEdges);
      initialized.current = true;
    }
  }, [posts, openComposer, setNodes, setEdges]);

  const handleConnect = async (connection: Connection) => {
    if (!user) {
      toast.error("Please login to link brainstorms");
      return;
    }

    // Handle linking brainstorms
    if (connection.source && connection.target) {
      openComposer({
        parentPostId: connection.target,
        relationType: 'linking'
      });
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading brainstorms...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        style={{ 
          backgroundColor: 'transparent',
          width: '100%',
          height: '100%',
        }}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
      >
        <Background
          color="rgba(72, 159, 227, 0.2)" 
          gap={20} 
          size={1}
          variant={BackgroundVariant.Dots}
        />
        <Controls 
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}