export interface Brainstorm {
  id: string;
  content: string;
  timestamp: Date;
  brainScore: number;
  threadCount: number;
  connectedIds: string[];
  author?: string;
  position: { x: number; y: number };
}

export interface BrainstormConnection {
  fromId: string;
  toId: string;
  type: 'inspiration' | 'continuation'; // inspiration = fresh idea, continuation = thread
  strength: number; // 0-1, how strongly connected the ideas are
}