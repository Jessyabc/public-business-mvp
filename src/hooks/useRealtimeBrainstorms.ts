import { useState, useEffect, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { Brainstorm } from '@/types/brainstorm';
import { mockBrainstorms, mockConnections } from '@/data/brainstorms';

export function useRealtimeBrainstorms() {
  const [brainstorms, setBrainstorms] = useState<Brainstorm[]>(mockBrainstorms);
  
  // Convert brainstorms to flow nodes
  const nodes: Node[] = brainstorms.map((brainstorm) => ({
    id: brainstorm.id,
    type: 'brainstorm',
    position: brainstorm.position,
    data: { brainstorm },
    draggable: true,
  }));

  // Convert connections to flow edges
  const edges: Edge[] = mockConnections.map((connection, index) => ({
    id: `edge-${index}`,
    source: connection.fromId,
    target: connection.toId,
    type: 'connection',
    data: { connection },
    animated: connection.type === 'inspiration',
  }));

  // Simulate real-time updates
  const addRandomBrainstorm = useCallback(() => {
    const newBrainstorm: Brainstorm = {
      id: `${Date.now()}`,
      content: getRandomBrainstormContent(),
      timestamp: new Date(),
      brainScore: Math.floor(Math.random() * 40) + 60, // 60-100
      threadCount: Math.floor(Math.random() * 10) + 1, // 1-10
      connectedIds: [],
      position: {
        x: Math.random() * 800 - 400, // -400 to 400
        y: Math.random() * 600 - 300, // -300 to 300
      },
    };

    setBrainstorms(prev => [...prev, newBrainstorm]);
    console.log('New brainstorm added:', newBrainstorm.content);
  }, []);

  // Start real-time simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 3 seconds
        addRandomBrainstorm();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [addRandomBrainstorm]);

  return { nodes, edges, brainstorms };
}

function getRandomBrainstormContent(): string {
  const contents = [
    "What if we could automate customer service with empathy? 🤖❤️",
    "Revolutionary idea: Solar-powered charging stations for cities",
    "Blockchain meets agriculture - traceability for every meal 🌱",
    "Virtual reality training for emergency responders",
    "AI-powered personal nutrition coaching",
    "Community-driven micro-investment platforms",
    "Sustainable packaging made from ocean plastic",
    "Real-time translation for global team collaboration",
    "Mental health apps with peer support networks",
    "Smart city infrastructure using IoT sensors",
    "Gamified learning for professional development",
    "Carbon footprint tracking for personal choices",
    "Decentralized social media with user ownership",
    "Predictive analytics for supply chain optimization",
    "Voice-activated accessibility tools for disabilities"
  ];
  
  return contents[Math.floor(Math.random() * contents.length)];
}