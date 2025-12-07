import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { ZoomIn, ZoomOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConstellationNode {
  id: string;
  title: string | null;
  content: string;
  x: number;
  y: number;
  depth: number;
  parentId: string | null;
}

interface ConstellationConnection {
  from: ConstellationNode;
  to: ConstellationNode;
  type: 'hard' | 'soft'; // hard = continuation, soft = cross-link
}

interface ConstellationViewProps {
  rootPostId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectPost?: (postId: string) => void;
}

export function ConstellationView({ 
  rootPostId, 
  isOpen, 
  onClose,
  onSelectPost 
}: ConstellationViewProps) {
  const [nodes, setNodes] = useState<ConstellationNode[]>([]);
  const [softLinks, setSoftLinks] = useState<{ parentId: string; childId: string }[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const fetchThread = async () => {
      // Recursive fetch of thread (hard links only for positioning)
      const visited = new Set<string>();
      const result: ConstellationNode[] = [];
      const allNodeIds: string[] = [];

      const fetchNode = async (postId: string, depth: number, parentId: string | null, angle: number) => {
        if (visited.has(postId) || depth > 4) return;
        visited.add(postId);
        allNodeIds.push(postId);

        const { data: post } = await supabase
          .from('posts')
          .select('id, title, content')
          .eq('id', postId)
          .single();

        if (!post) return;

        // Calculate position based on depth and angle
        const radius = depth * 120;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        result.push({
          id: post.id,
          title: post.title,
          content: post.content,
          x,
          y,
          depth,
          parentId
        });

        // Fetch children (hard links / continuations - relation_type 'reply' or 'hard')
        const { data: children } = await supabase
          .from('post_relations')
          .select('child_post_id')
          .eq('parent_post_id', postId)
          .in('relation_type', ['reply', 'hard']);

        if (children?.length) {
          const angleStep = (Math.PI * 0.8) / Math.max(children.length, 1);
          const startAngle = angle - (angleStep * (children.length - 1)) / 2;

          for (let i = 0; i < children.length; i++) {
            await fetchNode(
              children[i].child_post_id,
              depth + 1,
              postId,
              startAngle + angleStep * i
            );
          }
        }
      };

      await fetchNode(rootPostId, 0, null, -Math.PI / 2);
      setNodes(result);

      // Fetch soft links (cross-links) for all nodes
      if (allNodeIds.length > 0) {
        const { data: softRelations } = await supabase
          .from('post_relations')
          .select('parent_post_id, child_post_id')
          .in('relation_type', ['soft', 'cross_link'])
          .or(`parent_post_id.in.(${allNodeIds.join(',')}),child_post_id.in.(${allNodeIds.join(',')})`);

        if (softRelations) {
          setSoftLinks(softRelations.map(r => ({
            parentId: r.parent_post_id,
            childId: r.child_post_id
          })));
        }
      }
    };

    fetchThread();
  }, [rootPostId, isOpen]);

  // Calculate hard connections (continuations)
  const hardConnections = useMemo(() => {
    return nodes
      .filter(n => n.parentId)
      .map(n => {
        const parent = nodes.find(p => p.id === n.parentId);
        if (!parent) return null;
        return { from: parent, to: n, type: 'hard' as const };
      })
      .filter(Boolean) as ConstellationConnection[];
  }, [nodes]);

  // Calculate soft connections (cross-links)
  const softConnections = useMemo(() => {
    return softLinks
      .map(link => {
        const from = nodes.find(n => n.id === link.parentId);
        const to = nodes.find(n => n.id === link.childId);
        if (!from || !to) return null;
        // Avoid duplicating hard connections
        const isHardLink = from.id === to.parentId || to.id === from.parentId;
        if (isHardLink) return null;
        return { from, to, type: 'soft' as const };
      })
      .filter(Boolean) as ConstellationConnection[];
  }, [nodes, softLinks]);

  const allConnections = useMemo(() => 
    [...hardConnections, ...softConnections], 
    [hardConnections, softConnections]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <h2 className="text-lg font-medium text-white/80">Thread Constellation</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
              className="text-white/60 hover:text-white"
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            <span className="text-sm text-white/40">{Math.round(zoom * 100)}%</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(z => Math.min(2, z + 0.2))}
              className="text-white/60 hover:text-white"
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/60 hover:text-white ml-4"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          drag
          dragMomentum={false}
          onDrag={(_, info) => setPan(p => ({ 
            x: p.x + info.delta.x, 
            y: p.y + info.delta.y 
          }))}
        >
          <motion.div
            style={{
              scale: zoom,
              x: pan.x,
              y: pan.y
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                {/* Gradient for hard links (continuations) */}
                <linearGradient id="hardLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--accent) / 0.6)" />
                  <stop offset="100%" stopColor="hsl(280 70% 60% / 0.6)" />
                </linearGradient>
                {/* Gradient for soft links (cross-links) */}
                <linearGradient id="softLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(200 60% 50% / 0.4)" />
                  <stop offset="100%" stopColor="hsl(220 60% 60% / 0.4)" />
                </linearGradient>
              </defs>
              
              {/* Render soft connections first (behind) */}
              {softConnections.map((conn, i) => conn && (
                <motion.line
                  key={`soft-${i}`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ delay: hardConnections.length * 0.1 + i * 0.05, duration: 0.5 }}
                  x1={`calc(50% + ${conn.from.x}px)`}
                  y1={`calc(50% + ${conn.from.y}px)`}
                  x2={`calc(50% + ${conn.to.x}px)`}
                  y2={`calc(50% + ${conn.to.y}px)`}
                  stroke="url(#softLineGradient)"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  className="opacity-60"
                />
              ))}
              
              {/* Render hard connections (on top) */}
              {hardConnections.map((conn, i) => conn && (
                <motion.line
                  key={`hard-${i}`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  x1={`calc(50% + ${conn.from.x}px)`}
                  y1={`calc(50% + ${conn.from.y}px)`}
                  x2={`calc(50% + ${conn.to.x}px)`}
                  y2={`calc(50% + ${conn.to.y}px)`}
                  stroke="url(#hardLineGradient)"
                  strokeWidth="2"
                />
              ))}
            </svg>

            {/* Nodes */}
            {nodes.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring' }}
                onClick={() => onSelectPost?.(node.id)}
                className={cn(
                  "absolute cursor-pointer transition-all duration-200",
                  "hover:z-10"
                )}
                style={{
                  left: `calc(50% + ${node.x}px)`,
                  top: `calc(50% + ${node.y}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div
                  className={cn(
                    "rounded-full flex items-center justify-center text-center p-3",
                    "border backdrop-blur-sm transition-all duration-200",
                    "hover:scale-110",
                    node.depth === 0 
                      ? "w-24 h-24 bg-gradient-to-br from-[hsl(var(--accent)/0.3)] to-purple-500/20 border-[hsl(var(--accent)/0.5)] shadow-[0_0_30px_hsl(var(--accent)/0.3)]"
                      : "w-16 h-16 bg-white/5 border-white/20 hover:border-white/40"
                  )}
                >
                  <p className={cn(
                    "line-clamp-2",
                    node.depth === 0 ? "text-xs text-white" : "text-[10px] text-white/70"
                  )}>
                    {node.title || node.content.slice(0, 40)}
                  </p>
                </div>

                {/* Depth indicator */}
                {node.depth > 0 && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-white/30">
                    L{node.depth}
                  </div>
                )}
              </motion.div>
            ))}

            {/* Background stars */}
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: Math.random() * 0.5 + 0.1 }}
                className="absolute w-1 h-1 rounded-full bg-white"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[hsl(var(--accent))] to-purple-500" />
            <span>Root</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/20 border border-white/40" />
            <span>Reply</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-gradient-to-r from-[hsl(var(--accent)/0.6)] to-purple-500/60" />
            <span>Continuation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-blue-400/40" style={{ 
              backgroundImage: 'repeating-linear-gradient(90deg, hsl(200 60% 50% / 0.4), hsl(200 60% 50% / 0.4) 6px, transparent 6px, transparent 10px)' 
            }} />
            <span>Cross-link</span>
          </div>
          <span className="text-white/20">|</span>
          <span>Drag to pan, scroll to zoom</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
