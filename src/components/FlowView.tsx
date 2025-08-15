import React, { useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import BrainstormNodeComponent from './BrainstormNode';
import ConnectionEdgeComponent from './ConnectionEdge';
import { useRealtimeBrainstorms } from '@/hooks/useRealtimeBrainstorms';

const nodeTypes = {
  brainstorm: BrainstormNodeComponent,
};

const edgeTypes = {
  connection: ConnectionEdgeComponent,
};

export default function FlowView() {
  // Get real-time brainstorm data
  const { nodes: initialNodes, edges: initialEdges } = useRealtimeBrainstorms();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Initialize nodes and edges only once to prevent constant updates
  React.useEffect(() => {
    if (nodes.length === 0 && initialNodes.length > 0) {
      setNodes(initialNodes);
    }
  }, [initialNodes, nodes.length, setNodes]);

  React.useEffect(() => {
    if (edges.length === 0 && initialEdges.length > 0) {
      setEdges(initialEdges);
    }
  }, [initialEdges, edges.length, setEdges]);

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
          width: '100%',
          height: '100%',
        }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background
          color="rgba(72, 159, 227, 0.2)" 
          gap={20} 
          size={1}
          variant={BackgroundVariant.Dots}
        />
        <Controls 
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}