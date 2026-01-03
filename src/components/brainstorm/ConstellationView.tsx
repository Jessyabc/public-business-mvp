import { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { ZoomIn, ZoomOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostReaderModal } from '@/components/posts/PostReaderModal';
import { ConstellationBackground } from './ConstellationBackground';
import { useThrottleRAF } from '@/hooks/useThrottle';
import type { Post } from '@/types/post';

// PB Blue for continuations
const PB_BLUE = '#4A7C9B';

// Component for rendering connection lines using div rotation
function ConnectionLine({ 
  from, 
  to, 
  type 
}: { 
  from: { x: number; y: number }; 
  to: { x: number; y: number }; 
  type: 'hard' | 'soft'; // hard = continuation, soft = cross-link
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
        "absolute origin-left pointer-events-none",
        type === 'hard' ? "h-0.5" : "h-px"
      )}
      style={{
        left: `calc(50% + ${from.x}px)`,
        top: `calc(50% + ${from.y}px)`,
        width: `${length}px`,
        transform: `rotate(${angle}deg)`,
        ...(type === 'hard' 
          ? {
              // Continuation: straight blue PB glowing line
              background: PB_BLUE,
              boxShadow: `0 0 8px ${PB_BLUE}, 0 0 4px ${PB_BLUE}80`,
              opacity: 0.9,
            }
          : {
              // Cross-link: dashed white line
              background: 'white',
              backgroundImage: 'repeating-linear-gradient(90deg, white, white 8px, transparent 8px, transparent 16px)',
              opacity: 0.6,
            }
        )
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
  const [distantNodes, setDistantNodes] = useState<ConstellationNode[]>([]);
  const [softLinks, setSoftLinks] = useState<{ parentId: string; childId: string }[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isLegendVisible, setIsLegendVisible] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const zoomRef = useRef(1); // For immediate zoom updates
  const panRef = useRef({ x: 0, y: 0 }); // For immediate pan updates
  
  // Throttled zoom for rendering (60fps via RAF)
  const throttledZoom = useThrottleRAF(zoom);

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

      // Fetch distant context nodes (unrelated posts)
      const { data: distantPosts } = await supabase
        .from('posts')
        .select('id, title, content')
        .eq('type', 'brainstorm')
        .eq('kind', 'Spark')
        .eq('status', 'active')
        .neq('id', rootPostId)
        .not('id', 'in', `(${allNodeIds.length > 0 ? allNodeIds.join(',') : 'null'})`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (distantPosts) {
        // Generate random positions for distant nodes (within viewport but outside main cluster)
        const distantNodeList: ConstellationNode[] = distantPosts.map((post, i) => {
          const angle = (Math.PI * 2 * i) / distantPosts.length;
          const radius = 800 + Math.random() * 400; // 800-1200px from center
          return {
            id: post.id,
            title: post.title,
            content: post.content,
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            depth: 999, // Very high depth for rendering as distant
            parentId: null
          };
        });
        setDistantNodes(distantNodeList);
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

  // Auto-hide UI controls on idle
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      setIsHeaderVisible(false);
      setIsLegendVisible(false);
    }, 3000); // Hide after 3 seconds of inactivity
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    resetIdleTimer();
    // Initialize refs
    zoomRef.current = zoom;
    panRef.current = pan;
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [isOpen, resetIdleTimer, zoom, pan]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle scroll to zoom with throttling
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    let rafId: number | null = null;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.5, Math.min(3, zoomRef.current + delta));
      zoomRef.current = newZoom;
      
      // Throttle state update using RAF
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          setZoom(zoomRef.current);
          rafId = null;
        });
      }
      
      // Show UI on interaction
      setIsHeaderVisible(true);
      setIsLegendVisible(true);
      resetIdleTimer();
    };

    const canvas = canvasRef.current;
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isOpen, resetIdleTimer]);

  // Handle click on empty space to close
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the canvas background, not on nodes
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle node click - show post card and optionally navigate (debounced to prevent double-clicks)
  const clickTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const handleNodeClick = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    
    // Debounce: ignore rapid clicks on same node
    const existingTimeout = clickTimeoutRef.current.get(nodeId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    const timeout = setTimeout(() => {
      setSelectedPostId(nodeId);
      if (onSelectPost) {
        onSelectPost(nodeId);
      }
      clickTimeoutRef.current.delete(nodeId);
    }, 100);
    
    clickTimeoutRef.current.set(nodeId, timeout);
  }, [onSelectPost]);

  // Viewport culling: only render nodes within visible area + padding
  const visibleNodes = useMemo(() => {
    if (!canvasRef.current) return nodes;
    const viewportPadding = 200; // pixels
    const scale = throttledZoom;
    const viewLeft = -pan.x / scale - viewportPadding;
    const viewRight = -pan.x / scale + (window.innerWidth || 1920) / scale + viewportPadding;
    const viewTop = -pan.y / scale - viewportPadding;
    const viewBottom = -pan.y / scale + (window.innerHeight || 1080) / scale + viewportPadding;
    
    return nodes.filter(node => {
      const nodeX = node.x;
      const nodeY = node.y;
      return nodeX >= viewLeft && nodeX <= viewRight &&
             nodeY >= viewTop && nodeY <= viewBottom;
    });
  }, [nodes, throttledZoom, pan]);

  // Calculate hard connections (continuations) - memoized
  const hardConnections = useMemo(() => {
    return visibleNodes
      .filter(n => n.parentId)
      .map(n => {
        const parent = nodes.find(p => p.id === n.parentId);
        if (!parent) return null;
        return { from: parent, to: n, type: 'hard' as const };
      })
      .filter(Boolean) as ConstellationConnection[];
  }, [visibleNodes, nodes]);

  // Calculate soft connections (cross-links) - memoized
  const softConnections = useMemo(() => {
    return softLinks
      .map(link => {
        const from = nodes.find(n => n.id === link.parentId);
        const to = nodes.find(n => n.id === link.childId);
        if (!from || !to) return null;
        // Only show if both nodes are visible
        const fromVisible = visibleNodes.some(n => n.id === from.id);
        const toVisible = visibleNodes.some(n => n.id === to.id);
        if (!fromVisible || !toVisible) return null;
        // Avoid duplicating hard connections
        const isHardLink = from.id === to.parentId || to.id === from.parentId;
        if (isHardLink) return null;
        return { from, to, type: 'soft' as const };
      })
      .filter(Boolean) as ConstellationConnection[];
  }, [nodes, softLinks, visibleNodes]);

  // Calculate visual layer based on depth
  const getNodeLayer = (depth: number): 'foreground' | 'midfield' | 'background' => {
    if (depth === 0 || depth === 1) return 'foreground';
    if (depth === 2 || depth === 3) return 'midfield';
    return 'background';
  };

  // Continuous zoom-based opacity function
  const getDepthOpacity = useCallback((depth: number, zoom: number, baseOpacity: number): number => {
    if (depth === 0) {
      // Spark: always visible, slight fade at very low zoom
      return Math.max(0.8, baseOpacity * Math.min(1, zoom / 0.5));
    }
    
    if (depth === 999) {
      // Distant nodes: only visible at zoom > 1.8
      if (zoom < 1.8) return 0;
      const fadeProgress = Math.min(1, (zoom - 1.8) / 0.4);
      return baseOpacity * fadeProgress;
    }
    
    // Continuous fade-in based on depth
    const fadeInStart = 0.5 + (depth - 1) * 0.3;
    const fadeInEnd = fadeInStart + 0.4;
    
    if (zoom < fadeInStart) return 0;
    if (zoom > fadeInEnd) return baseOpacity;
    
    const fadeProgress = (zoom - fadeInStart) / (fadeInEnd - fadeInStart);
    return baseOpacity * fadeProgress;
  }, []);

  // Get node styling based on layer and zoom with continuous depth revelation
  const getNodeStyles = useCallback((depth: number, zoom: number, nodeId?: string) => {
    const layer = getNodeLayer(depth);
    const isSpark = depth === 0;
    const isContinuation = depth > 0 && depth <= 3;
    const isCrossLink = depth > 3;
    const isDistant = depth === 999;

    // Base opacity by layer (for hierarchy)
    let baseOpacity = 1.0;
    let blur = 0;
    let baseLabelOpacity = 1.0;
    
    if (layer === 'foreground') {
      // Foreground: crisp and dominant
      baseOpacity = 1.0;
      blur = 0;
      baseLabelOpacity = 1.0;
    } else if (layer === 'midfield') {
      // Mid-field: softened
      baseOpacity = 0.45;
      blur = 2.5;
      baseLabelOpacity = 0.65;
    } else {
      // Background: nearly ghosted
      baseOpacity = 0.10;
      blur = 4.5;
      baseLabelOpacity = 0.0;
    }

    // Distant nodes: extremely faint
    if (isDistant) {
      baseOpacity = 0.06;
      blur = 5;
      baseLabelOpacity = 0.0;
    }

    // Apply continuous zoom-based opacity
    const opacity = getDepthOpacity(depth, zoom, baseOpacity);
    const labelOpacity = getDepthOpacity(depth, zoom, baseLabelOpacity);

    // Size with variance for continuations, scaled smoothly with zoom
    let baseSize = 64;
    if (isSpark) {
      baseSize = 120;
    } else if (isDistant) {
      baseSize = 28;
    } else if (isCrossLink) {
      baseSize = 48;
    } else if (depth === 1) {
      baseSize = 64;
    } else {
      baseSize = 56;
    }

    // Add size variance for continuations (5-10% based on node ID hash)
    if (isContinuation && nodeId) {
      const hash = nodeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const variance = (hash % 11 - 5) * 0.02; // -10% to +10% in 2% steps
      baseSize = baseSize * (1 + variance);
    }

    // Scale size smoothly with zoom (20% increase per zoom level)
    const zoomScale = 1 + (zoom - 1) * 0.2;
    const size = baseSize * zoomScale;

    // Border width - softer for continuations
    let borderWidth = 1;
    if (isSpark) borderWidth = 3;
    else if (isContinuation) borderWidth = 1; // Softer stroke (reduced from 1.5)
    else borderWidth = 1;

    return { opacity, size, borderWidth, layer, isSpark, isContinuation, isCrossLink, isDistant, blur, labelOpacity };
  }, [getDepthOpacity]);

  // Get label visibility based on zoom and depth hierarchy
  const shouldShowLabel = (zoom: number, depth: number, isDistant: boolean): boolean => {
    if (isDistant) return zoom > 2.0; // Distant nodes only on very close zoom
    if (depth === 0) return true; // Always show Spark label
    if (depth >= 4) return zoom > 2.0; // Background only on very close zoom
    if (zoom > 1.5) return depth <= 3; // Close zoom - show foreground and mid-field
    if (zoom > 0.8) return depth <= 2; // Medium zoom - show first 2 levels
    return depth === 1; // Far zoom - show only direct children
  };

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
        onMouseMove={() => {
          setIsHeaderVisible(true);
          setIsLegendVisible(true);
          resetIdleTimer();
        }}
      >
        {/* Background Structure */}
        <ConstellationBackground 
          nodes={nodes} 
          sparkPosition={nodes.find(n => n.depth === 0) ? { x: 0, y: 0 } : undefined}
        />

        {/* Close Button - Always visible, top right (below GlobalNavigationMenu) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-20 right-4 z-[60] text-[var(--text-primary)] hover:text-white hover:bg-red-500/20 backdrop-blur-md bg-[var(--glass-bg)]/60 border-2 border-white/20 hover:border-red-400/50 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
          title="Close map view (Esc)"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Header - positioned below GlobalNavigationMenu to avoid being blocked */}
        <motion.div 
          className="absolute top-20 left-4 flex items-center z-[60] pointer-events-auto"
          style={{ right: '80px' }} // Leave space for close button
          initial={{ opacity: 1 }}
          animate={{ opacity: isHeaderVisible ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
          onHoverStart={() => setIsHeaderVisible(true)}
          onHoverEnd={() => resetIdleTimer()}
        >
          <h2 className="text-lg font-medium text-[var(--text-primary)] backdrop-blur-md bg-[var(--glass-bg)]/50 px-4 py-2 rounded-lg border border-[var(--glass-border)]/50 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
            Thread Constellation
          </h2>
          <div className="flex items-center gap-2 backdrop-blur-md bg-[var(--glass-bg)]/50 px-3 py-2 rounded-lg border border-[var(--glass-border)]/50 ml-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newZoom = Math.max(0.5, zoomRef.current - 0.2);
                zoomRef.current = newZoom;
                setZoom(newZoom);
                setIsHeaderVisible(true);
                resetIdleTimer();
              }}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            <span className="text-sm text-[var(--text-tertiary)] min-w-[3rem] text-center">{Math.round(throttledZoom * 100)}%</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newZoom = Math.min(3, zoomRef.current + 0.2);
                zoomRef.current = newZoom;
                setZoom(newZoom);
                setIsHeaderVisible(true);
                resetIdleTimer();
              }}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Canvas - with padding to avoid header/legend areas */}
        <motion.div
          ref={canvasRef}
          className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ paddingTop: '120px', paddingBottom: '80px', paddingLeft: '20px', paddingRight: '20px' }}
          drag
          dragMomentum={false}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onDragStart={() => {
            panRef.current = pan;
          }}
          onDrag={(_, info) => {
            // Update ref immediately for smooth dragging
            panRef.current = {
              x: pan.x + info.delta.x,
              y: pan.y + info.delta.y
            };
            // Throttle state update
            setPan(panRef.current);
          }}
          onClick={handleCanvasClick}
        >
          <motion.div
            style={{
              scale: throttledZoom,
              x: pan.x,
              y: pan.y,
              willChange: 'transform',
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Connection lines using div-based approach - adjust opacity based on zoom */}
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

            {/* Spark Radius Ring (visible influence radius) */}
            {nodes.find(n => n.depth === 0) && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '500px',
                  height: '500px',
                  borderRadius: '50%',
                  border: '1px solid rgba(72, 159, 227, 0.2)',
                  boxShadow: '0 0 40px rgba(72, 159, 227, 0.15), inset 0 0 40px rgba(72, 159, 227, 0.05)',
                  zIndex: 1,
                }}
              />
            )}

            {/* Distant Context Nodes - only render if zoom is high enough */}
            {throttledZoom > 1.5 && distantNodes.map((node, i) => {
              const styles = getNodeStyles(node.depth, throttledZoom, node.id);
              const showLabel = shouldShowLabel(throttledZoom, node.depth, true);
              if (styles.opacity <= 0) return null;
              return (
                <motion.div
                  key={`distant-${node.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: styles.opacity }}
                  transition={{ duration: 0.2 }}
                  className="absolute pointer-events-none"
                  style={{
                    left: `calc(50% + ${node.x}px)`,
                    top: `calc(50% + ${node.y}px)`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                    willChange: 'opacity',
                  }}
                >
                  <div
                    className="rounded-full"
                    style={{
                      width: `${styles.size}px`,
                      height: `${styles.size}px`,
                      backgroundColor: 'rgba(72, 159, 227, 0.1)',
                      border: '1px solid rgba(72, 159, 227, 0.2)',
                      filter: `blur(${styles.blur}px)`,
                    }}
                  />
                  {showLabel && (
                    <p className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-[var(--text-secondary)] opacity-30 whitespace-nowrap">
                      {node.title?.slice(0, 15) || node.content.slice(0, 15)}
                    </p>
                  )}
                </motion.div>
              );
            })}

            {/* Main Nodes - only render visible nodes */}
            {visibleNodes.map((node) => {
              const sparkNode = nodes.find(n => n.depth === 0);
              const styles = getNodeStyles(node.depth, throttledZoom, node.id);
              const showLabel = shouldShowLabel(throttledZoom, node.depth, false);
              const zIndex = styles.isSpark ? 30 : styles.layer === 'foreground' ? 20 : styles.layer === 'midfield' ? 10 : 5;
              
              // Skip rendering if opacity is 0 (not visible at current zoom)
              if (styles.opacity <= 0) return null;

              // Calculate rotation/lean toward Spark for continuations
              let rotationTransform = 'translate(-50%, -50%)';
              let shadowOffset = { x: 0, y: 0 };
              if (styles.isContinuation && sparkNode && node.depth > 0) {
                const dx = sparkNode.x - node.x;
                const dy = sparkNode.y - node.y;
                const angleToSpark = Math.atan2(dy, dx) * (180 / Math.PI);
                const tilt = 3; // degrees tilt toward Spark
                rotationTransform = `translate(-50%, -50%) rotate(${angleToSpark + 90 + tilt}deg)`;
                // Shadow offset in direction away from Spark (suggests motion)
                const distance = Math.sqrt(dx * dx + dy * dy);
                shadowOffset = {
                  x: (-dx / distance) * 3,
                  y: (-dy / distance) * 3,
                };
              }

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: styles.opacity, 
                    scale: 1,
                  }}
                  transition={{ 
                    opacity: { duration: 0.2 },
                    scale: { type: 'spring', stiffness: 200, damping: 20 },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(e, node.id);
                    setIsHeaderVisible(true);
                    setIsLegendVisible(true);
                    resetIdleTimer();
                  }}
                  className={cn(
                    "absolute cursor-pointer",
                    "hover:z-50"
                  )}
                  style={{
                    left: `calc(50% + ${node.x}px)`,
                    top: `calc(50% + ${node.y}px)`,
                    transform: rotationTransform,
                    zIndex,
                    willChange: 'opacity, transform',
                  }}
                >
                  {/* Spark Halo Ring */}
                  {styles.isSpark && (
                    <>
                      <div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                          width: `${styles.size + 20}px`,
                          height: `${styles.size + 20}px`,
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: `radial-gradient(circle, hsl(var(--accent)) 0%, hsl(var(--accent)) 20%, transparent 70%)`,
                          opacity: 0.3,
                          filter: 'blur(8px)',
                        }}
                      />
                    </>
                  )}

                  {/* Node Container */}
                  <div
                    className={cn(
                      "flex items-center justify-center text-center p-3 relative",
                      "border backdrop-blur-sm",
                      "hover:scale-110",
                      styles.isSpark && "rounded-full",
                      styles.isCrossLink && "rounded-lg",
                      !styles.isCrossLink && !styles.isSpark && "rounded-full"
                    )}
                    style={{ 
                      backdropFilter: styles.isSpark ? 'var(--glass-blur)' : `blur(calc(var(--glass-blur) * 0.7))`,
                      width: `${styles.size}px`,
                      height: `${styles.size}px`,
                      minWidth: `${styles.size}px`,
                      minHeight: `${styles.size}px`,
                      backgroundColor: styles.isSpark 
                        ? 'var(--glass-bg)' 
                        : styles.isCrossLink
                        ? 'rgba(72, 159, 227, 0.15)'
                        : 'var(--glass-bg)',
                      borderWidth: `${styles.borderWidth}px`,
                      borderStyle: styles.isCrossLink ? 'dashed' : 'solid',
                      borderColor: styles.isSpark
                        ? 'hsl(var(--accent)) / 0.8'
                        : styles.isContinuation
                        ? 'rgba(255, 255, 255, 0.3)'
                        : 'rgba(255, 255, 255, 0.2)',
                      // Motion styling for continuations: asymmetric gradient, trailing shadow
                      backgroundImage: styles.isContinuation
                        ? 'radial-gradient(circle at 45% 45%, rgba(72, 159, 227, 0.2), rgba(72, 159, 227, 0.05))'
                        : undefined,
                      boxShadow: styles.isSpark
                        ? '0 0 40px hsl(var(--accent)) / 0.6, 0 0 20px hsl(var(--accent)) / 0.4'
                        : styles.isContinuation
                        ? `${shadowOffset.x}px ${shadowOffset.y}px 12px rgba(72, 159, 227, 0.15), 0 0 8px rgba(72, 159, 227, 0.1)`
                        : '0 0 8px rgba(72, 159, 227, 0.05)',
                      filter: styles.blur > 0 ? `blur(${styles.blur}px)` : undefined,
                      opacity: 1, // Opacity handled by parent motion.div
                      transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
                      willChange: 'transform',
                    }}
                  >
                    {showLabel && (
                      <p 
                        className={cn(
                          "line-clamp-2 px-1",
                          styles.isSpark 
                            ? "text-xs font-medium text-[var(--text-primary)]" 
                            : styles.isCrossLink
                            ? "text-[9px] text-[var(--text-secondary)]"
                            : "text-[10px] text-[var(--text-secondary)]"
                        )}
                        style={{
                          opacity: styles.labelOpacity,
                        }}
                      >
                        {node.title || node.content.slice(0, styles.isSpark ? 50 : 30)}
                      </p>
                    )}
                    {!showLabel && styles.isSpark && (
                      <div className="w-4 h-4 rounded-full bg-[hsl(var(--accent))] opacity-80" />
                    )}
                  </div>

                  {/* Depth indicator - only show on close zoom */}
                  {node.depth > 0 && zoom > 1.2 && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-[var(--text-tertiary)]">
                      L{node.depth}
                    </div>
                  )}
                </motion.div>
              );
            })}

          </motion.div>
        </motion.div>

        {/* Legend */}
        <motion.div 
          className="absolute bottom-4 left-4 flex items-center gap-3 text-xs text-[var(--text-secondary)] backdrop-blur-md bg-[var(--glass-bg)]/50 px-4 py-2 rounded-lg border border-[var(--glass-border)]/50 shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
          initial={{ opacity: 1 }}
          animate={{ opacity: isLegendVisible ? 0.7 : 0.2 }}
          transition={{ duration: 0.3 }}
          onHoverStart={() => setIsLegendVisible(true)}
          onHoverEnd={() => resetIdleTimer()}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--accent))] border-2 border-[hsl(var(--accent))]/80 shadow-[0_0_8px_hsl(var(--accent))/0.5]" />
            <span>Spark</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)]" />
            <span>Continuation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-lg bg-white/20 border border-dashed border-white/60" />
            <span>Cross-link</span>
          </div>
          <span className="text-[var(--text-tertiary)]">|</span>
          <span className="text-[10px]">Drag to pan, scroll to zoom</span>
        </motion.div>

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
