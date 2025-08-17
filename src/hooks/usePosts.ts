import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  type: 'brainstorm' | 'insight' | 'report' | 'whitepaper' | 'webinar' | 'video';
  visibility: 'public' | 'my_business' | 'other_businesses' | 'draft';
  mode: 'public' | 'business';
  industry_id?: string;
  department_id?: string;
  metadata: any;
  likes_count: number;
  comments_count: number;
  views_count: number;
  t_score?: number;
  u_score?: number;
  status: 'active' | 'archived' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface CreatePostData {
  title?: string;
  content: string;
  type: 'brainstorm' | 'insight' | 'report' | 'whitepaper' | 'webinar' | 'video';
  visibility?: 'public' | 'my_business' | 'other_businesses' | 'draft';
  mode: 'public' | 'business';
  industry_id?: string;
  department_id?: string;
  metadata?: any;
}

export function usePosts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async (mode?: 'public' | 'business') => {
    setLoading(true);
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
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: CreatePostData) => {
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
      
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          ...postData,
          visibility: postData.visibility || 'public',
          metadata: postData.metadata || {},
        })
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
      
      return data;
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
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
    relation?: { parent_post_id: string; relation_type: 'continuation' | 'linking' }
  ) => {
    const newPost = await createPost(postData);
    if (!newPost || !relation) return newPost;

    try {
      const { error } = await supabase
        .from('post_relations')
        .insert({
          parent_post_id: relation.parent_post_id,
          child_post_id: (newPost as any).id,
          relation_type: relation.relation_type,
        });
      if (error) throw error;
    } catch (error) {
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
      const { data, error } = await supabase
        .from('posts')
        .update(postData)
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
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post",
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
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data as Post[]) || []);
    } catch (error: any) {
      console.error('Error fetching user posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your posts",
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
  }, [user]);

  return {
    posts,
    loading,
    createPost,
    createPostWithRelation,
    updatePost,
    deletePost,
    fetchPosts,
    fetchUserPosts,
    refetch: fetchPosts,
  };
}
