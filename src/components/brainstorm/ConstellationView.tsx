import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { ZoomIn, ZoomOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostReaderModal } from '@/components/posts/PostReaderModal';
import type { Post } from '@/types/post';

// Component for rendering connection lines using div rotation
function ConnectionLine({ 
  from, 
  to, 
  type 
}: { 
  from: { x: number; y: number }; 
  to: { x: number; y: number }; 
  type: 'hard' | 'soft';
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "absolute origin-left",
        type === 'hard' 
          ? "h-0.5 bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent))]/60" 
          : "h-px bg-gradient-to-r from-[hsl(var(--accent))]/40 to-[hsl(var(--accent))]/20"
      )}
      style={{
        left: `calc(50% + ${from.x}px)`,
        top: `calc(50% + ${from.y}px)`,
        width: `${length}px`,
        transform: `rotate(${angle}deg)`,
        opacity: type === 'hard' ? 0.8 : 0.5,
        ...(type === 'soft' && {
          backgroundImage: `repeating-linear-gradient(90deg, hsl(var(--accent)), hsl(var(--accent)) 6px, transparent 6px, transparent 10px)`
        })
      }}
    />
  );
}

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
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

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

  // Fetch full post data when selected
  useEffect(() => {
    if (!selectedPostId) {
      setSelectedPost(null);
      return;
    }

    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', selectedPostId)
        .single();

      if (!error && data) {
        setSelectedPost(data as Post);
      }
    };

    fetchPost();
  }, [selectedPostId]);

  // Handle scroll to zoom
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
    };

    const canvas = canvasRef.current;
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen]);

  // Handle click on empty space to close
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the canvas background, not on nodes
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle node click - show post card
  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedPostId(nodeId);
  };

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
        className="fixed inset-0 z-50 bg-[var(--background)]/95 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <h2 className="text-lg font-medium text-[var(--text-primary)]">Thread Constellation</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            <span className="text-sm text-[var(--text-tertiary)]">{Math.round(zoom * 100)}%</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(z => Math.min(2, z + 0.2))}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] ml-4"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <motion.div
          ref={canvasRef}
          className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
          drag
          dragMomentum={false}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onDrag={(_, info) => setPan(p => ({ 
            x: p.x + info.delta.x, 
            y: p.y + info.delta.y 
          }))}
          onClick={handleCanvasClick}
        >
          <motion.div
            style={{
              scale: zoom,
              x: pan.x,
              y: pan.y
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Connection lines using div-based approach */}
            {softConnections.map((conn, i) => conn && (
              <ConnectionLine 
                key={`soft-${i}`}
                from={conn.from}
                to={conn.to}
                type="soft"
              />
            ))}
            {hardConnections.map((conn, i) => conn && (
              <ConnectionLine 
                key={`hard-${i}`}
                from={conn.from}
                to={conn.to}
                type="hard"
              />
            ))}

            {/* Nodes */}
            {nodes.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring' }}
                onClick={(e) => handleNodeClick(e, node.id)}
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
                      ? "bg-[var(--glass-bg)] border-[hsl(var(--accent))/0.5] shadow-[0_0_30px_hsl(var(--accent))/0.3]"
                      : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[hsl(var(--accent))/0.4]"
                  )}
                  style={{ 
                    backdropFilter: 'blur(var(--glass-blur))',
                    width: `${node.depth === 0 ? 96 : 64}px`,
                    height: `${node.depth === 0 ? 96 : 64}px`,
                    minWidth: `${node.depth === 0 ? 96 : 64}px`,
                    minHeight: `${node.depth === 0 ? 96 : 64}px`,
                  }}
                >
                  <p className={cn(
                    "line-clamp-2",
                    node.depth === 0 ? "text-xs text-[var(--text-primary)]" : "text-[10px] text-[var(--text-secondary)]"
                  )}>
                    {node.title || node.content.slice(0, 40)}
                  </p>
                </div>

                {/* Depth indicator */}
                {node.depth > 0 && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-[var(--text-tertiary)]">
                    L{node.depth}
                  </div>
                )}
              </motion.div>
            ))}

          </motion.div>
        </motion.div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--accent))] border border-[hsl(var(--accent))]/50" />
            <span>Root</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)]" />
            <span>Reply</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent))]/60" />
            <span>Continuation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5" style={{ 
              backgroundImage: `repeating-linear-gradient(90deg, hsl(var(--accent)), hsl(var(--accent)) 6px, transparent 6px, transparent 10px)`,
              opacity: 0.4
            }} />
            <span>Cross-link</span>
          </div>
          <span className="text-[var(--text-tertiary)]">|</span>
          <span>Drag to pan, scroll to zoom</span>
        </div>

        {/* Post Card Modal - shown inside the map */}
        {selectedPost && (
          <PostReaderModal
            isOpen={!!selectedPost}
            onClose={() => {
              setSelectedPost(null);
              setSelectedPostId(null);
            }}
            post={selectedPost}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
