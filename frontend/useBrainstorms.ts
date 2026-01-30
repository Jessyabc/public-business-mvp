import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Brainstorm {
  id: string;
  title: string;
  content: string;
  user_id: string;
  author_user_id?: string; // alias for compatibility
  author_display_name?: string;
  visibility: string;
  is_public: boolean; // computed from visibility
  created_at: string;
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
        .from('posts')
        .select('*')
        .eq('type', 'brainstorm')
        .eq('status', 'active');

      // Apply filters
      if (filter === 'mine' && user) {
        query = query.eq('user_id', user.id);
      } else if (filter !== 'mine') {
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
        visibility: data.is_public ? 'public' : 'private',
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
        visibility: data.is_public ? 'public' : 'private',
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

// Removed useBrainstormStats hook - likes and comments are no longer supported for Brainstorm
// Removed useBrainstormInteractions hook - likes and comments are no longer supported for Brainstorm