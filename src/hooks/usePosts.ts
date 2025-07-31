import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  post_type: string;
  visibility: string;
  created_at: string;
  updated_at: string;
}

export function usePosts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Temporarily commented out until posts table is properly typed
      // const { data, error } = await supabase
      //   .from('posts')
      //   .select('*')
      //   .order('created_at', { ascending: false });

      // if (error) throw error;
      // setPosts(data || []);
      setPosts([]);
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

  const createPost = async (postData: {
    title?: string;
    content: string;
    post_type: string;
    visibility: string;
  }) => {
    if (!user) return;

    setLoading(true);
    try {
      // Temporarily show success without actual database call until posts table is properly typed
      // const { data, error } = await supabase
      //   .from('posts')
      //   .insert({
      //     user_id: user.id,
      //     ...postData,
      //   })
      //   .select()
      //   .single();

      // if (error) throw error;
      
      // Create mock post for now
      const mockPost: Post = {
        id: Math.random().toString(),
        user_id: user.id,
        title: postData.title,
        content: postData.content,
        post_type: postData.post_type,
        visibility: postData.visibility,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setPosts(prev => [mockPost, ...prev]);
      toast({
        title: "Success",
        description: "Post created successfully (demo mode)",
      });
      return mockPost;
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

  return {
    posts,
    loading,
    createPost,
    refetch: fetchPosts,
  };
}