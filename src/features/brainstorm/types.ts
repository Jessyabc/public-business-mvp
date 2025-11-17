import type { Post, PostRelationType } from '@/types/post';

/**
 * BrainstormRelationType - helper type for brainstorm-specific relations
 * Extracts only 'hard' and 'soft' relation types (excludes 'biz_in' and 'biz_out')
 */
export type BrainstormRelationType = Extract<PostRelationType, 'hard' | 'soft'>;

/**
 * BrainstormNode - composite type for graph visualization
 * Extends Post with additional visualization properties
 */
export type BrainstormNode = Post & {
  emoji?: string;
  tags: string[];
  position: { x: number; y: number };
  author: string;
};

/**
 * BrainstormEdge - edge type for graph visualization
 * Represents a relation between two posts in the brainstorm graph
 */
export interface BrainstormEdge {
  id: string;
  source: string;
  target: string;
  type: BrainstormRelationType;
  note?: string;
  created_at: string;
}

/**
 * BrainstormState - state interface for brainstorm graph
 * Used by legacy store (to be removed in future)
 */
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

/**
 * NodeFormData - form data structure for creating/editing nodes
 */
export interface NodeFormData {
  title: string;
  content: string;
  emoji: string;
  tags: string[];
}

/**
 * LinkFormData - form data structure for creating links
 */
export interface LinkFormData {
  type: BrainstormRelationType;
  note: string;
}
