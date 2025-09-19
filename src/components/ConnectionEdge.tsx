import { memo, useCallback } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, Edge, type Position } from '@xyflow/react';
import { BrainstormConnection } from '@/types/brainstorm';
import { useComposerStore } from '@/hooks/useComposerStore';

interface ConnectionEdgeData extends Record<string, unknown> {
  connection: BrainstormConnection;
}

export type ConnectionEdge = Edge<ConnectionEdgeData>;

interface ConnectionEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  data: ConnectionEdgeData;
}

function ConnectionEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: ConnectionEdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { connection } = data;
  
  // Enhanced interactive styling
  const edgeStyle = {
    stroke: connection.type === 'inspiration' ? '#489FE3' : 
            connection.type === 'continuation' ? '#F59E0B' : '#8B5CF6',
    strokeWidth: Math.max(2, connection.strength * 4),
    strokeOpacity: 0.7 + (connection.strength * 0.3),
    filter: `drop-shadow(0 0 4px ${
      connection.type === 'inspiration' ? 'rgba(72, 159, 227, 0.3)' :
      connection.type === 'continuation' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(139, 92, 246, 0.3)'
    })`,
    cursor: 'pointer',
  };

  const labelStyle = connection.type === 'inspiration' 
    ? 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 cursor-pointer'
    : connection.type === 'continuation'
    ? 'bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30 cursor-pointer'
    : 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30 cursor-pointer';

  const { openComposer } = useComposerStore();

  const handleEdgeClick = useCallback(() => {
    openComposer({ parentPostId: connection.toId, relationType: 'continuation' });
  }, [openComposer, connection.toId]);

  const handleLabelClick = useCallback(() => {
    openComposer({ parentPostId: connection.fromId, relationType: 'linking' });
  }, [openComposer, connection.fromId]);
  return (
    <>
      <BaseEdge 
        path={edgePath} 
        style={edgeStyle}
        className="hover:opacity-100 transition-opacity duration-200"
        onClick={handleEdgeClick}
      />
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-auto"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <div 
            className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm transition-all duration-200 ${labelStyle}`}
            onClick={handleLabelClick}
          >
            {connection.type === 'inspiration' ? '✨ Inspired' : 
             connection.type === 'continuation' ? '🔗 Thread' : '🔀 Link'}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(ConnectionEdgeComponent);