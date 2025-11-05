import { supabase } from '@/integrations/supabase/client';
import { 
  rpcListBrainstormNodes, 
  rpcListBrainstormEdgesForNodes,
  rpcSpaceChainHard,
  rpcListRecentPublicPosts,
  rpcCreateSoftLinks
} from '@/integrations/supabase/rpc';
import { BrainstormNode, BrainstormEdge } from '../types';
import { TABLES, BRAINSTORM_FILTERS } from '@/adapters/constants';
import { BRAINSTORM_WRITES_ENABLED } from '@/config/flags';
import { toast } from 'sonner';

export class BrainstormSupabaseAdapter {
  async loadNodes(options: { cursor?: string; limit?: number } = {}): Promise<BrainstormNode[]> {
    try {
      const { data, error } = await rpcListBrainstormNodes(options.cursor, options.limit);

      if (error) {
        console.warn(`Failed to load nodes via RPC:`, error.message);
        return [];
      }

      return (data || []).map((post: any) => ({
        id: post.id,
        title: post.title || 'Untitled',
        content: post.content || '',
        emoji: (post.metadata as any)?.emoji || '💡',
        tags: (post.metadata as any)?.tags || [],
        position: (post.metadata as any)?.position || { x: Math.random() * 400, y: Math.random() * 300 },
        created_at: post.created_at,
        author: post.display_name || 'Anonymous'
      }));
    } catch (err) {
      console.warn(`Failed to load brainstorm nodes:`, err);
      return [];
    }
  }

  async loadEdgesForNodes(nodeIds: string[]): Promise<BrainstormEdge[]> {
    if (nodeIds.length === 0) return [];
    
    try {
      const { data, error } = await rpcListBrainstormEdgesForNodes(nodeIds);

      if (error) {
        console.warn(`Failed to load edges via RPC:`, error.message);
        return [];
      }

      return (data || []).map((relation: any) => ({
        id: relation.id,
        source: relation.parent_post_id,
        target: relation.child_post_id,
        type: relation.relation_type === 'hard' ? 'hard' : 'soft',
        note: relation.note || '',
        created_at: relation.created_at
      }));
    } catch (err) {
      console.warn(`Failed to load brainstorm edges:`, err);
      return [];
    }
  }

  async loadEdges(): Promise<BrainstormEdge[]> {
    // Legacy method - use loadEdgesForNodes instead
    console.warn('loadEdges() is deprecated, use loadEdgesForNodes() instead');
    return [];
  }

  async saveNode(nodeData: Omit<BrainstormNode, 'id' | 'created_at'>): Promise<BrainstormNode> {
    if (!BRAINSTORM_WRITES_ENABLED) {
      const error = 'Brainstorm writes are disabled in config';
      toast.error(error);
      throw new Error(error);
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from(TABLES.BRAINSTORM_NODES)
        .insert({
          user_id: user.id,
          title: nodeData.title,
          content: nodeData.content,
          body: nodeData.content,
          kind: 'Spark',
          type: BRAINSTORM_FILTERS.TYPE,
          mode: BRAINSTORM_FILTERS.MODE,
          visibility: 'public',
          status: BRAINSTORM_FILTERS.STATUS,
          metadata: {
            emoji: nodeData.emoji,
            tags: nodeData.tags,
            position: nodeData.position
          } as any
        } as any)
        .select('id, title, content, metadata, created_at, user_id')
        .single();

      if (error) {
        console.warn('Failed to save node:', error.message);
        toast.error(`Failed to save: ${error.message}`);
        throw error;
      }

      toast.success('Idea saved successfully');
      
      return {
        id: data.id,
        title: data.title || 'Untitled',
        content: data.content || '',
        emoji: (data.metadata as any)?.emoji || '💡',
        tags: (data.metadata as any)?.tags || [],
        position: (data.metadata as any)?.position || nodeData.position,
        created_at: data.created_at,
        author: profile?.display_name || 'Anonymous'
      };
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to save node';
      console.warn('Save node error:', errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  }

  async updateNode(id: string, updates: Partial<BrainstormNode>): Promise<BrainstormNode> {
    if (!BRAINSTORM_WRITES_ENABLED) {
      const error = 'Brainstorm writes are disabled in config';
      toast.error(error);
      throw new Error(error);
    }

    try {
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.content) updateData.content = updates.content;
      
      if (updates.emoji || updates.tags || updates.position) {
        updateData.metadata = {
          emoji: updates.emoji,
          tags: updates.tags,
          position: updates.position
        };
      }

      const { data, error } = await supabase
        .from(TABLES.BRAINSTORM_NODES)
        .update(updateData)
        .eq('id', id)
        .select('id, title, content, metadata, created_at, user_id')
        .single();

      if (error) {
        console.warn('Failed to update node:', error.message);
        toast.error(`Failed to update: ${error.message}`);
        throw error;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', data.user_id)
        .single();

      return {
        id: data.id,
        title: data.title || 'Untitled',
        content: data.content || '',
        emoji: (data.metadata as any)?.emoji || '💡',
        tags: (data.metadata as any)?.tags || [],
        position: (data.metadata as any)?.position || { x: 0, y: 0 },
        created_at: data.created_at,
        author: profile?.display_name || 'Anonymous'
      };
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update node';
      console.warn('Update node error:', errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  }

  async deleteNode(id: string): Promise<void> {
    if (!BRAINSTORM_WRITES_ENABLED) {
      const error = 'Brainstorm writes are disabled in config';
      toast.error(error);
      throw new Error(error);
    }

    try {
      const { error } = await supabase
        .from(TABLES.BRAINSTORM_NODES)
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Failed to delete node:', error.message);
        toast.error(`Failed to delete: ${error.message}`);
        throw error;
      }

      toast.success('Idea deleted');
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete node';
      console.warn('Delete node error:', errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  }

  async saveEdge(edgeData: Omit<BrainstormEdge, 'id' | 'created_at'>): Promise<BrainstormEdge> {
    if (!BRAINSTORM_WRITES_ENABLED) {
      const error = 'Brainstorm writes are disabled in config';
      toast.error(error);
      throw new Error(error);
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.BRAINSTORM_EDGES)
        .insert({
          parent_post_id: edgeData.source,
          child_post_id: edgeData.target,
          relation_type: edgeData.type || 'soft'
        })
        .select('id, parent_post_id, child_post_id, relation_type, created_at')
        .single();

      if (error) {
        console.warn('Failed to save edge:', error.message);
        toast.error(`Failed to save connection: ${error.message}`);
        throw error;
      }

      toast.success('Connection saved successfully');
      
      return {
        id: data.id,
        source: data.parent_post_id,
        target: data.child_post_id,
        type: data.relation_type === 'hard' ? 'hard' : 'soft',
        note: edgeData.note || '',
        created_at: data.created_at
      };
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to save edge';
      console.warn('Save edge error:', errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  }

  async deleteEdge(id: string): Promise<void> {
    if (!BRAINSTORM_WRITES_ENABLED) {
      const error = 'Brainstorm writes are disabled in config';
      toast.error(error);
      throw new Error(error);
    }

    try {
      const { error } = await supabase
        .from(TABLES.BRAINSTORM_EDGES)
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Failed to delete edge:', error.message);
        toast.error(`Failed to delete connection: ${error.message}`);
        throw error;
      }

      toast.success('Connection deleted');
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete edge';
      console.warn('Delete edge error:', errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  }

  async fetchChainHard(
    startId: string, 
    direction: 'forward' | 'backward' = 'forward',
    limit: number = 25,
    maxDepth: number = 500
  ): Promise<BrainstormNode[]> {
    try {
      const { data, error } = await rpcSpaceChainHard(startId, direction, limit, maxDepth);

      if (error) {
        console.warn(`Failed to fetch hard chain:`, error.message);
        return [];
      }

      return (data || []).map((post: any) => ({
        id: post.id,
        title: post.title || 'Untitled',
        content: post.content || '',
        emoji: '💡',
        tags: [],
        position: { x: 0, y: 0 },
        created_at: post.created_at,
        author: 'Anonymous'
      }));
    } catch (err) {
      console.warn(`Failed to fetch hard chain:`, err);
      return [];
    }
  }
}

export async function getBrainstormGraph(): Promise<{ nodes: BrainstormNode[]; edges: BrainstormEdge[] }> {
  const adapter = new BrainstormSupabaseAdapter();
  
  try {
    const nodes = await adapter.loadNodes({ limit: 500 });
    console.log(`✅ Fetched ${nodes.length} brainstorm nodes`);
    
    if (nodes.length === 0) {
      console.log('⚠️ No nodes found in database');
      return { nodes: [], edges: [] };
    }

    const nodeIds = nodes.map(n => n.id);
    const edges = await adapter.loadEdgesForNodes(nodeIds);
    console.log(`✅ Fetched ${edges.length} brainstorm edges`);

    // Validate edges reference existing nodes
    const nodeIdSet = new Set(nodeIds);
    const orphanedEdges = edges.filter(e => 
      !nodeIdSet.has(e.source) || !nodeIdSet.has(e.target)
    );
    
    if (orphanedEdges.length > 0) {
      console.warn(`⚠️ Found ${orphanedEdges.length} edges referencing missing nodes`);
    }

    return { nodes, edges };
  } catch (err) {
    console.error('Failed to fetch brainstorm graph:', err);
    return { nodes: [], edges: [] };
  }
}

export async function fetchRecentPublicPosts(q?: string, limit = 15) {
  try {
    const { data, error } = await rpcListRecentPublicPosts(q, limit);
    if (error) throw error;
    return (data ?? []) as { post_id: string; post_type: string; title: string; created_at: string }[];
  } catch (err) {
    console.error('Failed to fetch recent public posts:', err);
    return [];
  }
}

export async function createSoftLinks(parentId: string, childIds: string[]) {
  if (!childIds.length) return [];
  try {
    const { data, error } = await rpcCreateSoftLinks(parentId, childIds);
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error('Failed to create soft links:', err);
    return [];
  }
}
