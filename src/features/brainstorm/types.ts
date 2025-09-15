export interface BrainstormNode {
  id: string;
  title: string;
  content: string;
  emoji?: string;
  tags: string[];
  position: { x: number; y: number };
  created_at: string;
  author: string;
}

export interface BrainstormEdge {
  id: string;
  source: string;
  target: string;
  type: 'hard' | 'soft';
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
  type: 'hard' | 'soft';
  note: string;
}