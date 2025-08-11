import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, Edge } from '@xyflow/react';
import { BrainstormConnection } from '@/types/brainstorm';

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
  sourcePosition: any;
  targetPosition: any;
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
    stroke: connection.type === 'inspiration' ? '#489FE3' : '#F59E0B',
    strokeWidth: Math.max(2, connection.strength * 4),
    strokeOpacity: 0.7 + (connection.strength * 0.3),
    filter: 'drop-shadow(0 0 4px rgba(72, 159, 227, 0.3))',
    cursor: 'pointer',
  };

  const labelStyle = connection.type === 'inspiration' 
    ? 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 cursor-pointer' 
    : 'bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30 cursor-pointer';

  const handleEdgeClick = () => {
    console.log('Connection clicked:', connection);
    // Add your click handler logic here
  };

  const handleLabelClick = () => {
    console.log('Connection label clicked:', connection);
    // Add your label click handler logic here
  };

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
            {connection.type === 'inspiration' ? '✨ Inspired' : '🔗 Thread'}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(ConnectionEdgeComponent);