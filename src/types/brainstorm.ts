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
  type: 'inspiration' | 'continuation' | 'linking'; // inspiration = fresh idea, continuation = thread, linking = manual connection
  strength: number; // 0-1, how strongly connected the ideas are
}