import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Brainstorm {
  id: string;
  idea_id?: string;
  title: string;
  content: string;
  author_user_id?: string;
  author_display_name: string;
  is_public: boolean;
  created_at: string;
}

export interface BrainstormStats {
  brainstorm_id: string;
  comments_count: number;
  likes_count: number;
}

export interface BrainstormInteraction {
  id: string;
  idea_id: string;
  type: 'like' | 'comment';
  user_id?: string;
  metadata: { text?: string };
  created_at: string;
}

type FilterType = 'newest' | 'most_interacted' | 'mine';

export function useBrainstorms() {
  const [brainstorms, setBrainstorms] = useState<Brainstorm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBrainstorms = async (filter: FilterType = 'newest', search?: string) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('idea_brainstorms')
        .select('id, idea_id, title, content, author_user_id, author_display_name, is_public, created_at');

      // Apply filters
      if (filter === 'mine' && user) {
        query = query.eq('author_user_id', user.id);
      } else if (filter !== 'mine') {
        query = query.eq('is_public', true);
      }

      // Apply search
      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      // Apply ordering
      if (filter === 'most_interacted') {
        // For most interacted, we'll fetch all and sort client-side for now
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      query = query.limit(50);

      const { data, error } = await query;

      if (error) throw error;
      setBrainstorms(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch brainstorms');
      toast({ title: "Error", description: "Failed to fetch brainstorms", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getBrainstorm = async (id: string): Promise<Brainstorm | null> => {
    try {
      const { data, error } = await supabase
        .from('idea_brainstorms')
        .select('id, idea_id, title, content, author_user_id, author_display_name, is_public, created_at')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching brainstorm:', err);
      return null;
    }
  };

  const createBrainstorm = async (data: {
    title: string;
    content: string;
    is_public: boolean;
    idea_id?: string;
  }) => {
    if (!user) throw new Error('Must be logged in to create brainstorms');

    const { error } = await supabase
      .from('idea_brainstorms')
      .insert({
        title: data.title,
        content: data.content,
        is_public: data.is_public,
        idea_id: data.idea_id,
        author_user_id: user.id,
        author_display_name: user.user_metadata?.name || user.email || 'Anonymous',
      });

    if (error) throw error;
    toast({ title: "Success", description: "Brainstorm created successfully!" });
  };

  const updateBrainstorm = async (id: string, data: {
    title: string;
    content: string;
    is_public: boolean;
  }) => {
    if (!user) throw new Error('Must be logged in to update brainstorms');

    const { error } = await supabase
      .from('idea_brainstorms')
      .update(data)
      .eq('id', id)
      .eq('author_user_id', user.id);

    if (error) throw error;
    toast({ title: "Success", description: "Brainstorm updated successfully!" });
  };

  const deleteBrainstorm = async (id: string) => {
    if (!user) throw new Error('Must be logged in to delete brainstorms');

    const { error } = await supabase
      .from('idea_brainstorms')
      .delete()
      .eq('id', id)
      .eq('author_user_id', user.id);

    if (error) throw error;
    toast({ title: "Success", description: "Brainstorm deleted successfully!" });
  };

  useEffect(() => {
    fetchBrainstorms();
  }, []);

  return {
    brainstorms,
    loading,
    error,
    fetchBrainstorms,
    getBrainstorm,
    createBrainstorm,
    updateBrainstorm,
    deleteBrainstorm,
  };
}

export function useBrainstormStats() {
  const [stats, setStats] = useState<Record<string, BrainstormStats>>({});

  const fetchStats = async (brainstormIds: string[]) => {
    if (brainstormIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('brainstorm_stats')
        .select('brainstorm_id, comments_count, likes_count')
        .in('brainstorm_id', brainstormIds);

      if (error) throw error;
      
      const statsMap = (data || []).reduce((acc, stat) => {
        acc[stat.brainstorm_id] = stat;
        return acc;
      }, {} as Record<string, BrainstormStats>);

      setStats(statsMap);
    } catch (err) {
      console.error('Error fetching brainstorm stats:', err);
    }
  };

  return { stats, fetchStats };
}

export function useBrainstormInteractions(brainstormId: string) {
  const [comments, setComments] = useState<BrainstormInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('idea_interactions')
        .select('id, idea_id, type, user_id, metadata, created_at')
        .eq('idea_id', brainstormId)
        .eq('type', 'comment')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments((data || []) as BrainstormInteraction[]);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (text: string) => {
    if (!user) {
      toast({ title: "Error", description: "Must be logged in to comment", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('idea_interactions')
        .insert({
          idea_id: brainstormId,
          type: 'comment',
          user_id: user.id,
          metadata: { text },
        });

      if (error) throw error;
      await fetchComments();
      toast({ title: "Success", description: "Comment added!" });
    } catch (err) {
      console.error('Error adding comment:', err);
      toast({ title: "Error", description: "Failed to add comment", variant: "destructive" });
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast({ title: "Error", description: "Must be logged in to like", variant: "destructive" });
      return;
    }

    try {
      // Check if already liked
      const { data: existing } = await supabase
        .from('idea_interactions')
        .select('id')
        .eq('idea_id', brainstormId)
        .eq('type', 'like')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Remove like
        const { error } = await supabase
          .from('idea_interactions')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from('idea_interactions')
          .insert({
            idea_id: brainstormId,
            type: 'like',
            user_id: user.id,
            metadata: {},
          });

        if (error) throw error;
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      toast({ title: "Error", description: "Failed to update like", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (brainstormId) {
      fetchComments();
    }
  }, [brainstormId]);

  return {
    comments,
    loading,
    addComment,
    toggleLike,
    refetch: fetchComments,
  };
}