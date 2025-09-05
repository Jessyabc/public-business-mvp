import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { usePosts, Post } from "@/hooks/usePosts";
import { useComposerStore } from "@/hooks/useComposerStore";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/ui/components/GlassCard";
import { ReactFlow, Node, Edge, Controls, Background, BackgroundVariant, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '@xyflow/react/dist/base.css';
import '../styles/react-flow-turbo.css';
import BrainstormNodeComponent, { BrainstormNodeData } from '@/components/BrainstormNode';
import ConnectionEdgeComponent from '@/components/ConnectionEdge';
import { Brain, User, Clock, ArrowLeft, Plus, Network } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { BrainstormConnection } from '@/types/brainstorm';
import { toast } from 'sonner';

const nodeTypes = {
  brainstorm: BrainstormNodeComponent,
};

const edgeTypes = {
  connection: ConnectionEdgeComponent,
};

export function BrainstormDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchPostById, fetchPostRelations, loading } = usePosts();
  const { openComposer } = useComposerStore();
  
  const [brainstorm, setBrainstorm] = useState<Post | null>(null);
  const [relations, setRelations] = useState<any[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [viewMode, setViewMode] = useState<'detail' | 'network'>('detail');

  const loadBrainstormData = useCallback(async () => {
    if (!id) return;
    
    try {
      const post = await fetchPostById(id);
      setBrainstorm(post);
      
      // Fetch related posts (continuations, links)
      const relationData = await fetchPostRelations(id);
      setRelations(relationData);
      
      // Create nodes for network view
      const mainNode: Node = {
        id: post.id,
        type: 'brainstorm',
        position: { x: 400, y: 200 },
        data: {
          post,
          onContinue: () => handleCreateContinuation(post.id),
          subflowDepth: 0,
        } as BrainstormNodeData,
        draggable: true,
      };
      
      const childNodes: Node[] = relationData.map((relation, index) => {
        const angle = (index / relationData.length) * 2 * Math.PI;
        const radius = 300;
        const x = Math.cos(angle) * radius + 400;
        const y = Math.sin(angle) * radius + 200;
        
        return {
          id: relation.child_post.id,
          type: 'brainstorm',
          position: { x, y },
          data: {
            post: relation.child_post,
            onContinue: () => handleCreateContinuation(relation.child_post.id),
            subflowDepth: 1,
            parentId: post.id,
          } as BrainstormNodeData,
          draggable: true,
        };
      });
      
      const childEdges: Edge[] = relationData.map(relation => ({
        id: `edge-${post.id}-${relation.child_post.id}`,
        source: post.id,
        target: relation.child_post.id,
        type: 'connection',
        data: {
          connection: {
            fromId: post.id,
            toId: relation.child_post.id,
            type: relation.relation_type === 'continuation' ? 'continuation' : 'linking',
            strength: 0.8,
          } as BrainstormConnection,
        },
        animated: true,
      }));
      
      setNodes([mainNode, ...childNodes]);
      setEdges(childEdges);
      
    } catch (error: any) {
      console.error('Error loading brainstorm:', error);
      toast.error('Failed to load brainstorm');
    }
  }, [id, fetchPostById, fetchPostRelations]);

  useEffect(() => {
    loadBrainstormData();
  }, [loadBrainstormData]);

  const handleCreateContinuation = (parentId: string) => {
    if (!user) {
      toast.error("Please login to continue this brainstorm");
      return;
    }
    openComposer({ 
      parentPostId: parentId, 
      relationType: 'continuation' 
    });
  };

  const handleCreateNew = () => {
    if (!user) {
      toast.error("Please login to create brainstorms");
      return;
    }
    openComposer({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <Brain className="w-16 h-16 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-blue-200">Loading brainstorm...</p>
        </div>
      </div>
    );
  }

  if (!brainstorm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Brainstorm not found</h1>
          <Button onClick={() => navigate("/")} variant="outline" className="text-blue-200 border-blue-400/30">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="absolute top-6 left-6 right-6 z-20">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="glass-card text-blue-200 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="glass-card p-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'detail' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('detail')}
                  className="h-8"
                >
                  Detail
                </Button>
                <Button
                  variant={viewMode === 'network' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('network')}
                  className="h-8"
                >
                  <Network className="w-4 h-4 mr-1" />
                  Network
                </Button>
              </div>
            </div>
            
            <Button
              onClick={handleCreateNew}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'detail' ? (
        /* Detail View */
        <div className="relative z-10 max-w-4xl mx-auto pt-24 pb-12 px-6">
          {/* Main Brainstorm */}
          <GlassCard className="border-primary/20 mb-8">
            <div className="p-8">
              <div className="mb-6">
                {brainstorm.title && (
                  <h1 className="text-3xl text-white leading-tight font-bold mb-4">
                    {brainstorm.title}
                  </h1>
                )}
                <div className="flex items-center gap-4 text-sm text-blue-200">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Author</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDistanceToNow(new Date(brainstorm.created_at))} ago</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Brain className="w-4 h-4" />
                    <span>{brainstorm.t_score || 'New'} T-Score</span>
                  </div>
                </div>
              </div>
              
              <div className="text-white text-lg leading-relaxed mb-6">
                <div className="whitespace-pre-wrap">
                  {brainstorm.content}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20">
                    Brainstorm
                  </span>
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-sm rounded-full border border-purple-500/20">
                    {brainstorm.mode}
                  </span>
                </div>
                
                <Button
                  onClick={() => handleCreateContinuation(brainstorm.id)}
                  variant="outline"
                  className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                >
                  Continue This Idea
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Continuations */}
          {relations.length > 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-2">Continuations & Links</h2>
                <p className="text-blue-200">See how others built upon this idea</p>
              </div>
              
              <div className="grid gap-6">
                {relations.map((relation, index) => (
                  <GlassCard key={relation.id} className="border-orange-500/20">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            relation.relation_type === 'continuation' 
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          }`}>
                            {relation.relation_type === 'continuation' ? 'Continuation' : 'Link'}
                          </span>
                          <span className="text-sm text-blue-200">
                            {formatDistanceToNow(new Date(relation.child_post.created_at))} ago
                          </span>
                        </div>
                        
                        <Button
                          onClick={() => navigate(`/brainstorm/${relation.child_post.id}`)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-200 hover:text-white"
                        >
                          View Full
                        </Button>
                      </div>
                      
                      <div className="text-white leading-relaxed">
                        {relation.child_post.content.length > 200 
                          ? `${relation.child_post.content.slice(0, 200)}...`
                          : relation.child_post.content
                        }
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Network View */
        <div className="w-full h-screen pt-20">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.3, maxZoom: 1.2 }}
            minZoom={0.1}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            style={{ 
              backgroundColor: 'transparent',
              width: '100%',
              height: '100%',
            }}
            nodesDraggable={true}
            nodesConnectable={false}
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
        </div>
      )}
    </div>
  );
}