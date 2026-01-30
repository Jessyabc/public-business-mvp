import { useEffect, useRef, useState } from 'react';
import { GitBranch, Sparkles, Link2, Network, Eye, TrendingUp } from 'lucide-react';
import { GlassSurface } from '@/components/ui/GlassSurface';

interface TimelineNode {
  id: string;
  icon: typeof Sparkles;
  title: string;
  description: string;
  feature: string;
}

const timelineNodes: TimelineNode[] = [
  {
    id: '1',
    icon: Sparkles,
    title: 'You share a spark',
    description: 'Post a brainstorm or business insight. Your idea enters the platform as a living entity.',
    feature: 'Create posts that become nodes in the idea network'
  },
  {
    id: '2', 
    icon: GitBranch,
    title: 'Others continue your thought',
    description: 'When someone builds directly on your idea, a hard link connects them. This creates a lineage chain where each continuation is a child of the original.',
    feature: 'Hard links form parent-child relationships in the lineage'
  },
  {
    id: '3',
    icon: Link2,
    title: 'Ideas cross-reference each other',
    description: 'Soft links connect related ideas across different threads. Your spark can reference other sparks, creating a web of interconnected thoughts.',
    feature: 'Soft links create cross-connections between ideas'
  },
  {
    id: '4',
    icon: Network,
    title: 'The lineage branches and grows',
    description: 'As more people contribute, your original idea branches into multiple threads. Each branch can spawn its own continuations, creating a living tree of thought.',
    feature: 'Watch your idea evolve into multiple parallel branches'
  },
  {
    id: '5',
    icon: Eye,
    title: 'The platform tracks every connection',
    description: 'Every link, continuation, and reference is preserved. You can trace any idea back to its origin and forward to all its descendants.',
    feature: 'Complete lineage tracking from root to all branches'
  },
  {
    id: '6',
    icon: TrendingUp,
    title: 'Ideas evolve in real time',
    description: 'The map updates as new connections form. Watch your spark grow, branch, and connect with others\' ideas across the platform.',
    feature: 'Real-time visualization of idea evolution'
  }
];

interface TimelineSectionProps {
  onComplete?: () => void;
}

export function TimelineSection({ onComplete }: TimelineSectionProps) {
  // onComplete is kept for backward compatibility but no longer triggers composer
  const [visibleNodes, setVisibleNodes] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const newVisibleNodes = new Set(visibleNodes);
        let hasChanges = false;

        entries.forEach((entry) => {
          const nodeId = entry.target.getAttribute('data-node-id');
          if (!nodeId) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            if (!newVisibleNodes.has(nodeId)) {
              newVisibleNodes.add(nodeId);
              hasChanges = true;
            }
          }
        });

        if (hasChanges) {
          setVisibleNodes(newVisibleNodes);
          
          // Check if final node is visible
          const finalNodeId = timelineNodes[timelineNodes.length - 1].id;
          if (newVisibleNodes.has(finalNodeId) && !isComplete) {
            setIsComplete(true);
            // onComplete callback removed - no longer needed for composer
          }
        }
      },
      { threshold: 0.6 }
    );

    // Observe all nodes
    nodeRefs.current.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [visibleNodes, isComplete, onComplete]);

  const setNodeRef = (nodeId: string) => (element: HTMLElement | null) => {
    if (element) {
      nodeRefs.current.set(nodeId, element);
    } else {
      nodeRefs.current.delete(nodeId);
    }
  };

  return (
    <section id="timeline" className="py-20 px-6 relative overflow-hidden" style={{ zIndex: 10, position: 'relative' }}>
      <div className="max-w-5xl mx-auto relative" style={{ zIndex: 10 }}>
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-4">
            <GitBranch className="w-8 h-8 text-[hsl(var(--accent))]" />
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
              How Ideas Live on PB
            </h2>
          </div>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Every idea you share becomes part of a living network. Here's how it works.
          </p>
        </div>

        {/* Lineage Timeline */}
        <div className="relative">
          {/* Main trunk line - flows downward with animated glow */}
          <svg 
            className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-2 pointer-events-none"
            style={{ zIndex: 0 }}
          >
            <defs>
              <linearGradient id="lineageGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
                <stop offset="25%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
                <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
                <stop offset="75%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <line 
              x1="50%" 
              y1="0" 
              x2="50%" 
              y2="100%" 
              stroke="url(#lineageGradient)" 
              strokeWidth="3"
              filter="url(#glow)"
              className="transition-all duration-1000"
              style={{
                strokeDasharray: visibleNodes.size > 0 ? 'none' : '8,4',
                opacity: visibleNodes.size > 0 ? 1 : 0.2
              }}
            />
          </svg>
          
          {/* Branching visual elements - show multiple branches with glass effect */}
          {timelineNodes.map((node, index) => {
            if (index === 0) return null; // Skip first node
            const isVisible = visibleNodes.has(node.id);
            return (
              <svg
                key={`branch-${node.id}`}
                className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none"
                style={{
                  top: `${(index - 0.5) * 16.66}%`,
                  width: '300px',
                  height: '100px',
                  zIndex: 1,
                  opacity: isVisible ? 0.4 : 0.15,
                  filter: 'blur(0.5px)'
                }}
              >
                <defs>
                  <linearGradient id={`branchGradient-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                <path
                  d={`M 150 0 Q ${index % 2 === 0 ? '200 50' : '100 50'} 150 100`}
                  stroke={`url(#branchGradient-${node.id})`}
                  strokeWidth="2.5"
                  fill="none"
                  strokeDasharray={isVisible ? 'none' : '4,4'}
                  className="transition-all duration-1000"
                />
                {/* Additional smaller branches */}
                <path
                  d={`M 150 0 Q ${index % 2 === 0 ? '180 30' : '120 30'} 150 60`}
                  stroke={`url(#branchGradient-${node.id})`}
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.5"
                  strokeDasharray={isVisible ? 'none' : '2,2'}
                  className="transition-all duration-1000"
                />
              </svg>
            );
          })}
          
          {timelineNodes.map((node, index) => {
            const isVisible = visibleNodes.has(node.id);
            const isEven = index % 2 === 0;
            const hasBranch = index < timelineNodes.length - 1;
            const IconComponent = node.icon;
            
            return (
              <div
                key={node.id}
                ref={setNodeRef(node.id)}
                data-node-id={node.id}
                className={`relative mb-24 last:mb-0 transition-all duration-1000 ${
                  isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-12'
                }`}
              >
                {/* Branching connector lines */}
                {hasBranch && (
                  <svg 
                    className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none"
                    style={{ 
                      top: '100%',
                      width: '200px',
                      height: '60px',
                      zIndex: 0
                    }}
                  >
                    <path
                      d={`M 100 0 Q ${isEven ? '150 30' : '50 30'} 100 60`}
                      stroke="hsl(var(--accent))"
                      strokeWidth="1.5"
                      fill="none"
                      strokeDasharray={isVisible ? 'none' : '3,3'}
                      opacity={isVisible ? 0.4 : 0.2}
                      className="transition-all duration-1000"
                    />
                  </svg>
                )}
                
                {/* Node - represents an idea in the lineage */}
                <div className="relative flex items-center justify-center mb-8">
                  {/* Icon container with glassmorphism */}
                  <div className={`
                    relative z-20 
                    transition-all duration-700
                    ${isVisible 
                      ? 'scale-110' 
                      : 'scale-100 opacity-50'
                    }
                  `}>
                    <GlassSurface className={`
                      w-16 h-16 rounded-full 
                      flex items-center justify-center
                      p-0
                      transition-all duration-700
                      ${isVisible 
                        ? 'shadow-lg shadow-[hsl(var(--accent))]/20 ring-2 ring-[hsl(var(--accent))]/30' 
                        : ''
                      }
                    `}>
                      <IconComponent className={`
                        w-8 h-8 
                        transition-all duration-700
                        ${isVisible 
                          ? 'text-[hsl(var(--accent))]' 
                          : 'text-[hsl(var(--accent))]/40'
                        }
                      `} />
                    </GlassSurface>
                    {/* Pulsing glass ring effect when visible */}
                    {isVisible && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-[hsl(var(--accent))]/20 animate-ping opacity-30 backdrop-blur-sm"></div>
                        <GlassSurface className="absolute -inset-2 rounded-full opacity-30 animate-pulse p-0 w-20 h-20" />
                      </>
                    )}
                  </div>
                  
                  {/* Branching indicator - multiple small branches with glass effect */}
                  {hasBranch && (
                    <div className={`
                      absolute left-1/2 transform -translate-x-1/2 -bottom-4
                      transition-all duration-700
                      ${isVisible ? 'opacity-100' : 'opacity-0'}
                      flex items-center gap-1
                    `}>
                      <div className="w-0.5 h-8 bg-gradient-to-b from-[hsl(var(--accent))] to-transparent backdrop-blur-sm"></div>
                      <div className="w-0.5 h-6 bg-gradient-to-b from-[hsl(var(--accent))]/60 to-transparent -ml-1 rotate-12 backdrop-blur-sm"></div>
                      <div className="w-0.5 h-6 bg-gradient-to-b from-[hsl(var(--accent))]/60 to-transparent ml-1 -rotate-12 backdrop-blur-sm"></div>
                    </div>
                  )}
                </div>
                
                {/* Content card - positioned to alternate sides */}
                <div className={`
                  relative z-10 max-w-lg mx-auto
                  transition-all duration-700
                  ${isEven 
                    ? 'lg:mr-auto lg:ml-0 lg:translate-x-12' 
                    : 'lg:ml-auto lg:mr-0 lg:-translate-x-12'
                  }
                `}>
                  <GlassSurface className="p-6 hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-[hsl(var(--accent))]/30 shadow-lg hover:shadow-xl">
                    <div className="flex items-start gap-3 mb-4">
                      <GlassSurface className={`
                        p-2 rounded-lg
                        transition-all duration-300
                        ${isVisible 
                          ? 'border border-[hsl(var(--accent))]/20 shadow-md' 
                          : 'border border-[hsl(var(--accent))]/10'
                        }
                      `}>
                        <IconComponent className={`
                          w-5 h-5 
                          transition-all duration-300
                          ${isVisible 
                            ? 'text-[hsl(var(--accent))]' 
                            : 'text-[hsl(var(--accent))]/40'
                          }
                        `} />
                      </GlassSurface>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 leading-tight">
                          {node.title}
                        </h3>
                        <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
                          {node.description}
                        </p>
                        <GlassSurface className={`
                          text-sm font-medium 
                          px-3 py-1.5 rounded-lg
                          transition-all duration-300
                          border
                          ${isVisible 
                            ? 'border-[hsl(var(--accent))]/30 text-[hsl(var(--accent))] shadow-sm' 
                            : 'border-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]/60'
                          }
                        `}>
                          {node.feature}
                        </GlassSurface>
                      </div>
                    </div>
                  </GlassSurface>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}