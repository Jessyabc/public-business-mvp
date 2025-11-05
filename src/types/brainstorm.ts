// New shared types for brainstorm posts
export interface PostNode {
  id: string;
  title?: string;
  content?: string;
  created_at?: string;
  likes_count?: number;
  views_count?: number;
  kind?: string;
  type?: string;
}

export interface PostEdge {
  parent_post_id: string;
  child_post_id: string;
  relation_type: 'hard' | 'soft';
}

// Legacy types for compatibility
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
  type: 'inspiration' | 'continuation' | 'linking';
  strength: number;
}