import type { BasePost, PostRelationType } from '@/types/post';

export type BrainstormPost = Pick<
  BasePost,
  'id' | 'title' | 'content' | 'user_id' | 'created_at' | 'likes_count' | 'views_count'
>;
export type BrainstormRelationType = Extract<PostRelationType, 'hard' | 'soft'>;

export type BrainstormNode = Omit<BrainstormPost, 'title' | 'content' | 'likes_count' | 'views_count'> & {
  title: string;
  content: string;
  emoji?: string;
  tags: string[];
  position: { x: number; y: number };
  author: string;
  likes_count?: number;
  views_count?: number;
};

export interface BrainstormEdge {
  id: string;
  source: string;
  target: string;
  type: BrainstormRelationType;
  note?: string;
  created_at: string;
}

export interface BrainstormState {
  nodes: BrainstormNode[];
  edges: BrainstormEdge[];
  selectedNode: string | null;
  selectedEdge: string | null;
  isCreatingLink: boolean;
  searchTerm: string;
  showHardEdges: boolean;
  showSoftEdges: boolean;
}

export interface NodeFormData {
  title: string;
  content: string;
  emoji: string;
  tags: string[];
}

export interface LinkFormData {
  type: BrainstormRelationType;
  note: string;
}