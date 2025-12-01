// LEGACY – do not extend. Kept temporarily for reference during migration.
// New code should use usePosts from src/hooks/usePosts.ts
// This hook wraps the posts table but uses legacy interface types for backward compatibility.

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { Post } from '@/types/post';

export interface Brainstorm
  extends Pick<
    Post,
    'id' | 'title' | 'content' | 'user_id' | 'visibility' | 'created_at' | 'likes_count' | 'comments_count'
  > {
  author_user_id?: string; // alias for compatibility
  author_display_name?: string;
  is_public: boolean; // computed from visibility
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

/**
 * LEGACY: This hook is maintained for backward compatibility.
 * New code should use the posts system (ComposerModal, NodeForm, usePosts).
 * This hook has been updated to use 'draft' instead of 'private' for visibility.
 */
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
        .from('posts')
        .select('*')
        .eq('type', 'brainstorm')
        .eq('kind', 'Spark')
        .eq('mode', 'public')
        .eq('status', 'active');

      // Apply filters
      if (filter === 'mine' && user) {
        query = query.eq('user_id', user.id);
        // For 'mine' filter, include both public and draft posts
      } else if (filter !== 'mine') {
        // For public feeds, only show public visibility
        query = query.eq('visibility', 'public');
      }

      // Apply search
      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      // Apply ordering
      if (filter === 'most_interacted') {
        query = query.order('likes_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      query = query.limit(50);

      const { data, error } = await query;

      if (error) throw error;
      
      // Map the data to include computed fields for backward compatibility
      const mappedData = (data || []).map((post: any) => ({
        ...post,
        author_user_id: post.user_id,
        is_public: post.visibility === 'public',
      }));
      
      setBrainstorms(mappedData);
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
        .from('posts')
        .select('*')
        .eq('id', id)
        .eq('type', 'brainstorm')
        .single();

      if (error) throw error;
      
      return {
        ...data,
        author_user_id: data.user_id,
        is_public: data.visibility === 'public',
      } as Brainstorm;
    } catch (err) {
      console.error('Error fetching brainstorm:', err);
      return null;
    }
  };

  const createBrainstorm = async (data: {
    title: string;
    content: string;
    is_public: boolean;
  }) => {
    if (!user) throw new Error('Must be logged in to create brainstorms');

    const { error } = await supabase
      .from('posts')
      .insert({
        title: data.title,
        content: data.content,
        body: data.content,
        type: 'brainstorm',
        mode: 'public',
        visibility: data.is_public ? 'public' : 'draft', // Changed from 'private' to 'draft'
        status: 'active',
        user_id: user.id,
        kind: 'Spark',
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
      .from('posts')
      .update({
        title: data.title,
        content: data.content,
        body: data.content,
        visibility: data.is_public ? 'public' : 'draft', // Changed from 'private' to 'draft'
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('type', 'brainstorm');

    if (error) throw error;
    toast({ title: "Success", description: "Brainstorm updated successfully!" });
  };

  const deleteBrainstorm = async (id: string) => {
    if (!user) throw new Error('Must be logged in to delete brainstorms');

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('type', 'brainstorm');

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

// Note: This hook uses the legacy idea_interactions table for backward compatibility.
// Interactions reference post IDs via the idea_id column.
export function useBrainstormInteractions(brainstormId: string) {
  const [comments, setComments] = useState<BrainstormInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
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

  const checkLikeStatus = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('idea_interactions')
        .select('id')
        .eq('idea_id', brainstormId)
        .eq('type', 'like')
        .eq('user_id', user.id)
        .maybeSingle();

      setIsLiked(!!data);
    } catch (err) {
      console.error('Error checking like status:', err);
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
      
      // Increment post comment count
      await supabase.rpc('increment_post_comments', { post_id: brainstormId });
      
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
      const { data: existing } = await supabase
        .from('idea_interactions')
        .select('id')
        .eq('idea_id', brainstormId)
        .eq('type', 'like')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Remove like
        const { error } = await supabase
          .from('idea_interactions')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
        setIsLiked(false);
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
        
        // Increment post like count
        await supabase.rpc('increment_post_likes', { p_post_id: brainstormId });
        
        setIsLiked(true);
      }
      
      toast({ 
        title: "Success", 
        description: isLiked ? "Like removed" : "Post liked!" 
      });
    } catch (err) {
      console.error('Error toggling like:', err);
      toast({ title: "Error", description: "Failed to update like", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (brainstormId) {
      fetchComments();
      checkLikeStatus();
    }
  }, [brainstormId]);

  return {
    comments,
    loading,
    isLiked,
    addComment,
    toggleLike,
    refetch: fetchComments,
  };
}