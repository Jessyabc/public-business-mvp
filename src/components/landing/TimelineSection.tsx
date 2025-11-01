import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { GlassSurface } from '@/components/ui/GlassSurface';

interface TimelineNode {
  id: string;
  title: string;
  description?: string;
}

const timelineNodes: TimelineNode[] = [
  {
    id: '1',
    title: 'Curiosity deserves a stage.',
    description: 'Every question has the power to spark innovation'
  },
  {
    id: '2', 
    title: 'People and businesses think better together.',
    description: 'Collaboration amplifies creativity and insight'
  },
  {
    id: '3',
    title: 'PB is a living map of ideas—branching in real time.',
    description: 'Watch thoughts evolve and connect across industries'
  },
  {
    id: '4',
    title: 'You can start an open idea and watch it grow.',
    description: 'Plant a seed of curiosity and see what blooms'
  },
  {
    id: '5',
    title: 'We highlight the brightest sparks so others can build.',
    description: 'Curated insights that deserve broader attention'
  },
  {
    id: '6',
    title: 'And the idea is to spark even more…',
    description: 'Creating an endless cycle of discovery and growth'
  }
];

interface TimelineSectionProps {
  onComplete?: () => void;
}

export function TimelineSection({ onComplete }: TimelineSectionProps) {
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
            setTimeout(() => {
              onComplete?.();
            }, 800);
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
    <section id="timeline" className="py-20 px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Scroll indicator */}
        <div className="text-center mb-16">
          <ChevronDown className="w-8 h-8 text-pb-blue mx-auto animate-bounce" />
          <p className="text-ink-base/60 mt-2 text-sm">Scroll to explore our story</p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-accent/20"></div>
          
          {timelineNodes.map((node, index) => (
            <div
              key={node.id}
              ref={setNodeRef(node.id)}
              data-node-id={node.id}
              className={`relative mb-32 last:mb-0 transition-all duration-700 ${
                visibleNodes.has(node.id) 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              } ${index % 2 === 0 ? 'text-left' : 'text-right'}`}
            >
              {/* Timeline dot */}
              <div className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full transition-all duration-500 ${
                visibleNodes.has(node.id) 
                  ? 'bg-pb-blue scale-125 elevation-16' 
                  : 'bg-pb-blue/30 scale-100'
              }`}></div>
              
              {/* Content card */}
              <GlassSurface 
                className={`max-w-lg mx-auto ${
                  index % 2 === 0 ? 'lg:mr-auto lg:ml-0' : 'lg:ml-auto lg:mr-0'
                } ${index % 2 === 0 ? 'lg:translate-x-8' : 'lg:-translate-x-8'}`}
              >
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4 leading-tight">
                  {node.title}
                </h3>
                {node.description && (
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {node.description}
                  </p>
                )}
              </GlassSurface>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}