import type { BasePost, PostRelationType } from '@/types/post';

// New shared types for brainstorm posts
export type PostNode = {
  id: BasePost['id'];
} & Partial<
  Pick<BasePost, 'title' | 'content' | 'created_at' | 'likes_count' | 'views_count' | 'kind' | 'type'>
>;

export interface PostEdge {
  parent_post_id: string;
  child_post_id: string;
  relation_type: Extract<PostRelationType, 'hard' | 'soft'>;
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