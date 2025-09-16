import { supabase } from '@/integrations/supabase/client';
import { BrainstormNode, BrainstormEdge } from '../types';
import { TABLES, BRAINSTORM_FILTERS } from '@/adapters/constants';
import { BRAINSTORM_WRITES_ENABLED } from '@/config/flags';
import { toast } from 'sonner';

export class BrainstormSupabaseAdapter {
  async loadNodes(): Promise<BrainstormNode[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.BRAINSTORM_NODES)
        .select('id, title, content, metadata, created_at, user_id')
        .eq('type', BRAINSTORM_FILTERS.TYPE)
        .eq('mode', BRAINSTORM_FILTERS.MODE)
        .eq('status', BRAINSTORM_FILTERS.STATUS)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn(`Failed to load nodes from ${TABLES.BRAINSTORM_NODES}:`, error.message);
        return [];
      }

      // Get profile data separately to avoid join issues
      const nodeData = data || [];
      const userIds = [...new Set(nodeData.map(post => post.user_id).filter(Boolean))];
      
      let profilesMap = new Map();
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds);
          
        if (profiles) {
          profilesMap = new Map(profiles.map(p => [p.id, p.display_name]));
        }
      }

      return nodeData.map((post: any) => ({
        id: post.id,
        title: post.title || 'Untitled',
        content: post.content || '',
        emoji: (post.metadata as any)?.emoji || '💡',
        tags: (post.metadata as any)?.tags || [],
        position: (post.metadata as any)?.position || { x: Math.random() * 400, y: Math.random() * 300 },
        created_at: post.created_at,
        author: profilesMap.get(post.user_id) || 'Anonymous'
      }));
    } catch (err) {
      console.warn(`Table ${TABLES.BRAINSTORM_NODES} may not exist or is not accessible:`, err);
      return [];
    }
  }

  async loadEdges(): Promise<BrainstormEdge[]> {
    // Edges table doesn't exist yet - return empty array
    console.warn(`Table ${TABLES.BRAINSTORM_EDGES} does not exist yet`);
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
          type: BRAINSTORM_FILTERS.TYPE,
          mode: BRAINSTORM_FILTERS.MODE,
          visibility: 'public',
          status: BRAINSTORM_FILTERS.STATUS,
          metadata: {
            emoji: nodeData.emoji,
            tags: nodeData.tags,
            position: nodeData.position
          } as any
        })
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
    console.warn(`Table ${TABLES.BRAINSTORM_EDGES} does not exist yet - edges not supported`);
    toast.error('Edge connections not yet available');
    throw new Error('Edges table not implemented');
  }

  async deleteEdge(id: string): Promise<void> {
    console.warn(`Table ${TABLES.BRAINSTORM_EDGES} does not exist yet - edges not supported`);
    throw new Error('Edges table not implemented');
  }
}
