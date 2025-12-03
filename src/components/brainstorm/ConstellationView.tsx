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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const fetchThread = async () => {
      // Recursive fetch of thread
      const visited = new Set<string>();
      const result: ConstellationNode[] = [];

      const fetchNode = async (postId: string, depth: number, parentId: string | null, angle: number) => {
        if (visited.has(postId) || depth > 4) return;
        visited.add(postId);

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

        // Fetch children
        const { data: children } = await supabase
          .from('post_relations')
          .select('child_post_id')
          .eq('parent_post_id', postId)
          .eq('relation_type', 'reply');

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
    };

    fetchThread();
  }, [rootPostId, isOpen]);

  const connections = useMemo(() => {
    return nodes
      .filter(n => n.parentId)
      .map(n => {
        const parent = nodes.find(p => p.id === n.parentId);
        if (!parent) return null;
        return { from: parent, to: n };
      })
      .filter(Boolean);
  }, [nodes]);

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
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(72,159,227,0.5)" />
                  <stop offset="100%" stopColor="rgba(147,112,219,0.5)" />
                </linearGradient>
              </defs>
              {connections.map((conn, i) => conn && (
                <motion.line
                  key={i}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  x1={`calc(50% + ${conn.from.x}px)`}
                  y1={`calc(50% + ${conn.from.y}px)`}
                  x2={`calc(50% + ${conn.to.x}px)`}
                  y2={`calc(50% + ${conn.to.y}px)`}
                  stroke="url(#lineGradient)"
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
                      ? "w-24 h-24 bg-gradient-to-br from-[var(--accent)]/30 to-purple-500/20 border-[var(--accent)]/50 shadow-[0_0_30px_rgba(72,159,227,0.3)]"
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
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-500" />
            <span>Root</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/20 border border-white/40" />
            <span>Reply</span>
          </div>
          <span className="text-white/20">|</span>
          <span>Drag to pan, scroll to zoom</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
