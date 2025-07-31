import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import BrainstormNodeComponent from './BrainstormNode';
import ConnectionEdgeComponent from './ConnectionEdge';
import { mockBrainstorms, mockConnections } from '@/data/brainstorms';

const nodeTypes = {
  brainstorm: BrainstormNodeComponent,
};

const edgeTypes = {
  connection: ConnectionEdgeComponent,
};

export default function FlowView() {
  // Convert brainstorms to flow nodes
  const initialNodes: Node[] = useMemo(() => 
    mockBrainstorms.map((brainstorm) => ({
      id: brainstorm.id,
      type: 'brainstorm',
      position: brainstorm.position,
      data: { brainstorm },
      draggable: true,
    })), []
  );

  // Convert connections to flow edges
  const initialEdges: Edge[] = useMemo(() => 
    mockConnections.map((connection, index) => ({
      id: `edge-${index}`,
      source: connection.fromId,
      target: connection.toId,
      type: 'connection',
      data: { connection },
      animated: connection.type === 'inspiration',
    })), []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(() => {
    // Disable manual connections for now
  }, []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        style={{ 
          backgroundColor: 'transparent',
        }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background
          color="rgba(255, 255, 255, 0.1)" 
          gap={20} 
          size={1}
        />
      </ReactFlow>
    </div>
  );
}