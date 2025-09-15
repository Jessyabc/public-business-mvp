import { BrainstormNode, BrainstormEdge } from '../types';

// Stub adapter - returns empty data until backend is connected
export class BrainstormSupabaseAdapter {
  async loadNodes(): Promise<BrainstormNode[]> {
    console.log('Brainstorm adapter: loadNodes called - returning empty array (backend not connected)');
    return [];
  }

  async loadEdges(): Promise<BrainstormEdge[]> {
    console.log('Brainstorm adapter: loadEdges called - returning empty array (backend not connected)');
    return [];
  }

  async saveNode(node: Omit<BrainstormNode, 'id' | 'created_at'>): Promise<void> {
    console.log('Brainstorm adapter: saveNode called - no persistence (backend not connected)', node);
    throw new Error('Backend not connected - cannot persist node');
  }

  async updateNode(id: string, updates: Partial<BrainstormNode>): Promise<void> {
    console.log('Brainstorm adapter: updateNode called - no persistence (backend not connected)', { id, updates });
    throw new Error('Backend not connected - cannot update node');
  }

  async deleteNode(id: string): Promise<void> {
    console.log('Brainstorm adapter: deleteNode called - no persistence (backend not connected)', id);
    throw new Error('Backend not connected - cannot delete node');
  }

  async saveEdge(edge: Omit<BrainstormEdge, 'id' | 'created_at'>): Promise<void> {
    console.log('Brainstorm adapter: saveEdge called - no persistence (backend not connected)', edge);
    throw new Error('Backend not connected - cannot persist edge');
  }

  async deleteEdge(id: string): Promise<void> {
    console.log('Brainstorm adapter: deleteEdge called - no persistence (backend not connected)', id);
    throw new Error('Backend not connected - cannot delete edge');
  }
}