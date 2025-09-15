import { BrainstormNode, BrainstormEdge } from '../types';

// Stub adapter – returns empty data until backend is connected (no mocks persisted)
export class BrainstormSupabaseAdapter {
  async loadNodes(): Promise<BrainstormNode[]> {
    return [];
  }

  async loadEdges(): Promise<BrainstormEdge[]> {
    return [];
  }

  // Intentionally throw to prevent accidental persistence until backend is wired
  async saveNode(_: Omit<BrainstormNode, 'id' | 'created_at'>): Promise<never> {
    throw new Error('Backend not connected');
  }

  async updateNode(_: string, __: Partial<BrainstormNode>): Promise<never> {
    throw new Error('Backend not connected');
  }

  async deleteNode(_: string): Promise<never> {
    throw new Error('Backend not connected');
  }

  async saveEdge(_: Omit<BrainstormEdge, 'id' | 'created_at'>): Promise<never> {
    throw new Error('Backend not connected');
  }

  async deleteEdge(_: string): Promise<never> {
    throw new Error('Backend not connected');
  }
}
