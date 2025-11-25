import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type {
  Post,
  PostInsertPayload,
  PostMode,
  PostRelationType,
} from '@/types/post';

export type CreatePostData = Omit<PostInsertPayload, 'user_id'>;

export function usePosts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (mode?: PostMode) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('posts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (mode) {
        query = query.eq('mode', mode);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts((data as Post[]) || []);
    } catch (err: unknown) {
      console.error('Error fetching posts:', err);
      const message =
        err instanceof Error
          ? err.message
          : err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string'
            ? (err as { message: string }).message
            : 'Failed to fetch posts';
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createPost = async (postData: CreatePostData): Promise<Post | null> => {
    // Enforce auth - no anonymous posts
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a post",
        variant: "destructive",
      });
      return null;
    }

    // Check if user can create business posts
    if (postData.mode === 'business' && postData.type !== 'brainstorm') {
      const { rpcCanCreateBusinessPosts } = await import('@/integrations/supabase/rpc');
      const { data: canCreate } = await rpcCanCreateBusinessPosts(user.id);
      
      if (!canCreate) {
        toast({
          title: "Business Member Required",
          description: "You need to be a Business member to create business posts. Business membership is available by invitation only.",
          variant: "destructive",
        });
        return null;
      }
    }

    setLoading(true);
    try {
      console.log('Creating post with data:', { user_id: user.id, ...postData });
      
      // Apply canonical rules for post creation
      let insertPayload: any = {
        user_id: user.id,
        content: postData.content,
        type: postData.type,
        mode: postData.mode,
        title: postData.title ?? null,
        body: postData.body ?? postData.content,
        kind: postData.kind,
        visibility: postData.visibility,
        status: postData.status ?? 'active',
        org_id: postData.org_id,
        industry_id: postData.industry_id,
        department_id: postData.department_id,
        metadata: postData.metadata ? JSON.parse(JSON.stringify(postData.metadata)) : {},
        t_score: postData.t_score,
        u_score: postData.u_score,
        published_at: postData.published_at,
      };

      // Canonical rules: enforce correct values based on type
      if (postData.type === 'brainstorm') {
        // Force canonical values for brainstorms
        insertPayload.mode = 'public';
        insertPayload.visibility = 'public';
        insertPayload.kind = 'Spark';
        insertPayload.org_id = null;
      } else if (postData.type === 'insight' && postData.mode === 'business') {
        // Ensure kind is BusinessInsight for business insights
        insertPayload.kind = insertPayload.kind || 'BusinessInsight';
        
        // Require org_id for business insights
        if (!insertPayload.org_id) {
          toast({
            title: "Organization Required",
            description: "Business insights require an organization ID",
            variant: "destructive",
          });
          setLoading(false);
          return null;
        }
      }
      
      const { data, error } = await supabase
        .from('posts')
        .insert(insertPayload)
        .select()
        .single();

      console.log('Post creation result:', { data, error });
      
      if (error) {
        console.error('Post creation error details:', error);
        throw error;
      }
      
      // Add the new post to the local state
      setPosts(prev => [data as Post, ...prev]);
      
      toast({
        title: "Success",
        description: `${postData.type === 'brainstorm' ? 'Brainstorm' : 'Post'} created successfully`,
      });
      
      return data as Post;
    } catch (error: unknown) {
      console.error('Error creating post:', error);
      let description = 'Failed to create post';
      if (error instanceof Error) {
        description = error.message;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        description = (error as { message: string }).message;
      }
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create a post and optionally link it to a parent via post_relations
  const createPostWithRelation = async (
    postData: CreatePostData,
    relation?: { parent_post_id: string; relation_type: Extract<PostRelationType, 'hard' | 'soft'> }
  ) => {
    const newPost = await createPost(postData);
    if (!newPost || !relation) return newPost;

    try {
      const { error } = await supabase
        .from('post_relations')
        .insert({
          parent_post_id: relation.parent_post_id,
          child_post_id: newPost.id,
          relation_type: relation.relation_type,
        });
      if (error) throw error;
    } catch (error: unknown) {
      console.error('Error creating post relation:', error);
      toast({
        title: 'Relation not linked',
        description: 'Your post was created but linking failed.',
        variant: 'destructive',
      });
    }

    return newPost;
  };

  const updatePost = async (id: string, postData: Partial<CreatePostData>) => {
    if (!user) return null;

    setLoading(true);
    try {
      const updatePayload = {
        ...postData,
        metadata: postData.metadata ? JSON.parse(JSON.stringify(postData.metadata)) : {}
      };
      
      const { data, error } = await supabase
        .from('posts')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Update the post in local state
      setPosts(prev => prev.map(post => 
        post.id === id ? { ...post, ...data as Post } : post
      ));
      
      toast({
        title: "Success",
        description: "Post updated successfully",
      });
      
      return data;
    } catch (error: unknown) {
      console.error('Error updating post:', error);
      let description = 'Failed to update post';
      if (error instanceof Error) {
        description = error.message;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        description = (error as { message: string }).message;
      }
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Remove the post from local state
      setPosts(prev => prev.filter(post => post.id !== id));
      
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      
      return true;
    } catch (error: unknown) {
      console.error('Error deleting post:', error);
      let description = 'Failed to delete post';
      if (error instanceof Error) {
        description = error.message;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        description = (error as { message: string }).message;
      }
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchPostById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return data as Post;
    } catch (err: unknown) {
      console.error('Error fetching post:', err);
      const message =
        err instanceof Error
          ? err.message
          : err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string'
            ? (err as { message: string }).message
            : 'Failed to fetch post';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchPostRelations = async (postId: string) => {
    try {
      // Fetch child posts (continuations/links)
      // Only include 'hard' and 'soft' relation types (exclude biz_in, biz_out)
      const { data: relations, error } = await supabase
        .from('post_relations')
        .select(`
          *,
          child_post:posts!post_relations_child_post_id_fkey(*)
        `)
        .eq('parent_post_id', postId)
        .in('relation_type', ['hard', 'soft']);

      if (error) throw error;
      return relations || [];
    } catch (err: unknown) {
      console.error('Error fetching post relations:', err);
      return [];
    }
  };

  const fetchUserPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      // Use my_posts_view for permission-safe access to user's posts
      const { data, error } = await supabase
        .from('my_posts_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data as Post[]) || []);
    } catch (err: unknown) {
      console.error('Error fetching user posts:', err);
      const message =
        err instanceof Error
          ? err.message
          : err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string'
            ? (err as { message: string }).message
            : 'Failed to fetch your posts';
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    fetchUserPosts,
    fetchPostById,
    fetchPostRelations,
    createPost,
    createPostWithRelation,
    updatePost,
    deletePost,
    refetch: fetchPosts,
  };
}
