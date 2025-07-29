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
  
  // Style based on connection type
  const edgeStyle = {
    stroke: connection.type === 'inspiration' ? '#3B82F6' : '#F59E0B',
    strokeWidth: Math.max(1, connection.strength * 3),
    strokeOpacity: 0.6 + (connection.strength * 0.4),
  };

  const labelStyle = connection.type === 'inspiration' 
    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
    : 'bg-orange-500/20 text-orange-400 border-orange-500/30';

  return (
    <>
      <BaseEdge path={edgePath} style={edgeStyle} />
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-none"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <div className={`px-2 py-1 rounded text-xs font-medium border ${labelStyle}`}>
            {connection.type === 'inspiration' ? 'Inspired' : 'Thread'}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(ConnectionEdgeComponent);