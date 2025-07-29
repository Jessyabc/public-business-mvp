import { Brainstorm, BrainstormConnection } from "@/types/brainstorm";

export const mockBrainstorms: Brainstorm[] = [
  {
    id: "1",
    content: "This is a Spark (aka brainstorm)",
    timestamp: new Date("2024-01-15T10:30:00"),
    brainScore: 75,
    threadCount: 3,
    connectedIds: ["2", "3"],
    position: { x: 0, y: 0 },
  },
  {
    id: "2", 
    content: "Another brilliant idea waiting to be explored!",
    timestamp: new Date("2024-01-16T14:20:00"),
    brainScore: 92,
    threadCount: 7,
    connectedIds: ["1", "3"],
    position: { x: 400, y: 200 },
  },
  {
    id: "3",
    content: "The future of business starts with a simple spark ✨",
    timestamp: new Date("2024-01-17T09:15:00"),
    brainScore: 88,
    threadCount: 5,
    connectedIds: ["1", "2"],
    position: { x: 200, y: 400 },
  },
];

export const mockConnections: BrainstormConnection[] = [
  {
    fromId: "1",
    toId: "2", 
    type: "inspiration",
    strength: 0.8,
  },
  {
    fromId: "1",
    toId: "3",
    type: "continuation", 
    strength: 0.6,
  },
  {
    fromId: "2",
    toId: "3",
    type: "inspiration",
    strength: 0.9,
  },
];

export const getConnectedBrainstorms = (brainstormId: string): Brainstorm[] => {
  const brainstorm = mockBrainstorms.find(b => b.id === brainstormId);
  if (!brainstorm) return [];
  
  return mockBrainstorms
    .filter(b => brainstorm.connectedIds.includes(b.id))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};