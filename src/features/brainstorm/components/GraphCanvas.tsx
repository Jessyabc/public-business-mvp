import { useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize, Smartphone } from 'lucide-react';
import { useBrainstormStore } from '../store';

export function GraphCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    nodes,
    edges,
    selectedNode,
    showHardEdges,
    showSoftEdges,
    setSelectedNode,
  } = useBrainstormStore();

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedNode(null);
    }
  }, [setSelectedNode]);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  }, [selectedNode, setSelectedNode]);

  // Mobile controls for pan/zoom
  const MobileControls = () => (
    <div className="md:hidden absolute top-4 right-4 flex gap-2">
      <Button size="sm" variant="secondary" className="glass-button">
        <ZoomIn className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="secondary" className="glass-button">
        <ZoomOut className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="secondary" className="glass-button">
        <Maximize className="w-4 h-4" />
      </Button>
    </div>
  );

  if (nodes.length === 0) {
    return (
      <Card className="h-full glass-card flex items-center justify-center">
        <div className="text-center p-8">
          <Smartphone className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No ideas yet</h3>
          <p className="text-muted-foreground">Connect backend to load brainstorm data</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative h-full">
      <div
        ref={canvasRef}
        className="h-full w-full glass-card rounded-lg overflow-hidden cursor-move select-none"
        onClick={handleCanvasClick}
        style={{ 
          backgroundImage: 'radial-gradient(circle, hsl(var(--muted)) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Render nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
              selectedNode === node.id 
                ? 'scale-110 shadow-lg ring-2 ring-primary' 
                : 'hover:scale-105'
            }`}
            style={{
              left: node.position.x + 400,
              top: node.position.y + 300,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleNodeClick(node.id);
            }}
          >
            <Card className="glass-card p-4 min-w-[200px] max-w-[250px]">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{node.emoji || '💡'}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground truncate">
                    {node.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {node.content}
                  </p>
                  {node.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {node.tags.slice(0, 2).map((tag, i) => (
                        <span 
                          key={i}
                          className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ))}

        {/* Render edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {edges.map((edge) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) return null;
            
            const shouldShow = (edge.type === 'hard' && showHardEdges) || 
                              (edge.type === 'soft' && showSoftEdges);
            
            if (!shouldShow) return null;

            return (
              <line
                key={edge.id}
                x1={sourceNode.position.x + 400}
                y1={sourceNode.position.y + 300}
                x2={targetNode.position.x + 400}
                y2={targetNode.position.y + 300}
                stroke={edge.type === 'hard' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                strokeWidth="2"
                strokeDasharray={edge.type === 'soft' ? '5,5' : '0'}
                opacity="0.6"
              />
            );
          })}
        </svg>
      </div>

      <MobileControls />
    </div>
  );
}