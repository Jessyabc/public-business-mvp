export interface Brainstorm {
  id: string;
  content: string;
  timestamp: Date;
  brainScore: number;
  threadCount: number;
  connectedIds: string[];
  author?: string;
}

export interface BrainstormConnection {
  fromId: string;
  toId: string;
  strength: number; // 0-1, how strongly connected the ideas are
}